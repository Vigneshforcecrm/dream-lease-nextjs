// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

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
    console.log('product_data ------>', product_data);
    const url = `${apiEndpoint}/services/data/v${parseFloat(apiVersion).toFixed(1)}/commerce/sales-orders/actions/place`;
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
        graphId: "graphId",
        records: [
          {
            referenceId: "refOrder",
            record: {
              attributes: {
                type: "Order",
                method: "POST",
              },
              Name: `${user_record.Name}-${productNames}`,
              BillToContactId: user_record.ContactId,
              AccountId: user_record.AccountId,
              EffectiveDate: today,
              Pricebook2Id: product_data.productData.prices[0].priceBookId,
              //TotalAmount: product_data.totalPrice
            },
          },
          {
            referenceId: "refAppUsageAssign",
            record: {
              attributes: {
                type: "AppUsageAssignment",
                method: "POST",
              },
              RecordId: "@{refOrder.id}",
              AppUsageType: "RevenueLifecycleManagement",
            },
          },
          {
            referenceId: "refOrderItem",
            record: {
              attributes: {
                type: "OrderItem",
                method: "POST"
              },
              OrderId: "@{refOrder.id}",
              Quantity: 1,
              PricebookEntryId: product_data.productData.prices[0].priceBookEntryId,
              Product2Id: product_data.productId,
              UnitPrice: product_data.totalPrice,
              Description: product_data.productData.description,
            }
          }
        ],
      },
    };

    const response = await axios.post(url, rawPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    console.log('Order -------->', response)

    if (response.status === 201 || response.status === 200) {
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
