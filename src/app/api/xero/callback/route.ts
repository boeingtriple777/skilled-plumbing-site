import { XeroClient } from 'xero-node';
import { NextResponse } from 'next/server';

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUris: [process.env.XERO_REDIRECT_URI!],
  scopes: process.env.XERO_SCOPES!.split(' '),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    
    // Grab the token set from Xero
    const tokenSet = await xero.apiCallback(url.href);
    await xero.updateTenants();
    
    const activeTenantId = xero.tenants[0].tenantId;

    // For the POC, we'll just log these. 
    // In production, you'd save tokenSet and activeTenantId to your database.
    console.log("Access Token:", tokenSet.access_token);
    console.log("Tenant ID:", activeTenantId);

    // Redirect back to your app's dashboard or success page
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error("Xero callback failed:", error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}