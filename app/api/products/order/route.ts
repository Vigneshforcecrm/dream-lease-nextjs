import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const product_data: any = await request.json();
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/salesforce/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token

    const apiEndpoint = process.env.SALESFORCE_BASE_ENDPOINT;
    const apiVersion = process.env.SALESFORCE_API_VERSION;
    const pricebookId = process.env.SALESFORCE_PRICEBOOK_ID;

    if (!apiEndpoint || !apiVersion || !pricebookId) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const base_url = tokenData?.instance_url || apiEndpoint;
    const queryUrl = `${base_url}/services/data/v${parseFloat(apiVersion).toFixed(1)}/query/?q=${encodeURIComponent(
      `SELECT Id, Name, ContactId, AccountId FROM User WHERE Name = 'Global Excel' LIMIT 1`
    )}`;

    const user_Info = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const user_data_response: any = await user_Info.json();
    const user_record = user_data_response.records?.[0];

    if (!user_record) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();

    const productNames = product_data?.productData.name;
    const url = `${apiEndpoint}/services/data/v${parseFloat(apiVersion).toFixed(1)}/commerce/quotes/actions/place`;
    const rawPayload = {
      pricingPref: "System",
      configurationInput: "RunAndAllowErrors",
      configurationOptions: {
        validateProductCatalog: false,
        validateAmendRenewCancel: false,
        executeConfigurationRules: false,
        addDefaultConfiguration: false,
      },
      graph: {
        graphId: "1",
        records: [
          {
            referenceId: "refQuote",
            record: {
              attributes: {
                type: "Quote",
                method: "POST",
              },
              Name: `${user_record.Name}-${productNames}`,
              Pricebook2Id: pricebookId,
              description: product_data?.description || '',
              Source__c: "WebStore",
              ContactId: user_record.ContactId,
              BillToContactId: user_record.ContactId,
              AccountId__c: user_record.AccountId,
            },
          },
          {
            referenceId: "refQuoteAction",
            record: {
              attributes: {
                type: "QuoteAction",
                method: "POST",
              },
              QuoteId: "@{refQuote.id}",
              Type: "Add",
            },
          },
          {
            referenceId: "refAppUsageAssign",
            record: {
              attributes: {
                type: "AppUsageAssignment",
                method: "POST",
              },
              RecordId: "@{refQuote.id}",
              AppUsageType: "RevenueLifecycleManagement",
            },
          },
          {
            referenceId: `refOrderItem1`,
            record: {
              attributes: {
                type: "QuoteLineItem",
                method: "POST",
              },
              QuoteId: "@{refQuote.id}",
              QuoteActionId: "@{refQuoteAction.id}",
              Quantity: 1,
              priceBookEntryId: product_data.productData.prices[0].priceBookEntryId,
              Product2Id: product_data.productId,
              UnitPrice: product_data.totalPrice,
              PeriodBoundary: "Anniversary",
              ServiceDate: today.toISOString().split('T')[0],
            },
          },
        ],
      },
    };
    

    console.log('Sending order request to Salesforce:', {
      url,
      userName: user_record.Name,
      productCount: 1,
      contactId: user_record.ContactId,
      accountId: user_record.AccountId,
    });

    const response = await axios.post(url, rawPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.status === 200) {
      console.log('Order placed successfully:', response.data);
      return NextResponse.json({
        success: true,
        data: response.data,
        message: 'Order placed successfully',
      });
    }

    return NextResponse.json({ error: 'Failed to place order' }, { status: response.status });
  } catch (error: any) {
    console.error('Order API Error:', error);

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
