import { XeroClient } from 'xero-node';
import { NextResponse } from 'next/server';

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUris: [process.env.XERO_REDIRECT_URI!],
  scopes: process.env.XERO_SCOPES!.split(' '),
});

export async function GET() {
  try {
    const consentUrl = await xero.buildConsentUrl();
    return NextResponse.redirect(consentUrl);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to build Xero consent URL' }, { status: 500 });
  }
}