import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const username = process.env.SALESFORCE_USERNAME;
    const password = process.env.SALESFORCE_PASSWORD;
    const baseEndpoint = process.env.SALESFORCE_BASE_ENDPOINT;

    if (!clientId || !clientSecret || !username || !password || !baseEndpoint) {
      console.error('Missing Salesforce environment variables:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        username: !!username,
        password: !!password,
        baseEndpoint: !!baseEndpoint
      });
      return NextResponse.json(
        { error: 'Missing required Salesforce credentials' },
        { status: 500 }
      );
    }

    const tokenUrl = `${baseEndpoint}/services/oauth2/token`;

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    console.log('Salesforce token response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Salesforce token error response:', errorData);
      return NextResponse.json(
        { 
          error: 'Failed to authenticate with Salesforce',
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    
    return NextResponse.json({
      access_token: tokenData.access_token,
      instance_url: tokenData.instance_url,
      token_type: tokenData.token_type,
    });

  } catch (error: any) {
    console.error('Token API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}