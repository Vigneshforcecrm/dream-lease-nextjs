import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // First, get the access token from your Salesforce token API
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/salesforce/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token; 

    const apiEndpoint = process.env.SALESFORCE_BASE_ENDPOINT;
    const apiVersion = process.env.SALESFORCE_API_VERSION;
    const pricebookId = process.env.SALESFORCE_PRICEBOOK_ID;

    if (!apiEndpoint || !apiVersion || !pricebookId) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const url = `${apiEndpoint}/services/data/v${parseFloat(apiVersion).toFixed(1)}/connect/cpq/products`;

    let payload: any = {
      correlationId: 'corrId',
      priceBookId: pricebookId,
    };

    if (!body?.isCategory && body?.catalogId) {
      payload.catalogId = body.catalogId;
    } else if (body?.isCategory && body?.catalogId) {
      payload.categoryId = body.catalogId;
    }

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return NextResponse.json(response.data);
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: response.status }
    );

  } catch (error: any) {
    console.error('Products API Error:', error);
    
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error_description || error.message || 'Internal Server Error';

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}


export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET method not implemented' }, { status: 405 });
}