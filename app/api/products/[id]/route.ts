// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = await context.params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

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

    const url = `${apiEndpoint}/services/data/v${parseFloat(apiVersion).toFixed(1)}/connect/cpq/products/${id}`;

    const payload = {
      priceBookId: pricebookId,
    };

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
      { error: 'Failed to fetch product details' },
      { status: response.status }
    );

  } catch (error: any) {
    console.error('Product Detail API Error:', error);
    
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error_description || error.message || 'Internal Server Error';

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST method not implemented for individual products' }, { status: 405 });
}