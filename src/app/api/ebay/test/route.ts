// app/api/ebay/test/route.ts
// Temporary route to test your eBay credentials
import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.EBAY_PRODUCTION_CLIENT_ID;
    const clientSecret = process.env.EBAY_PRODUCTION_CLIENT_SECRET;

    // Check if credentials exist
    if (!clientId || !clientSecret) {
        return NextResponse.json({
            error: 'Missing credentials',
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            message: 'Check your .env.local file'
        }, { status: 400 });
    }

    // Show credential format (safely)
    const info = {
        clientIdLength: clientId.length,
        clientIdPreview: clientId.substring(0, 20) + '...',
        clientIdFormat: /^[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Z]+-[a-z0-9]+-[a-z0-9]+$/.test(clientId),
        clientSecretLength: clientSecret.length,
        clientSecretFormat: /^[A-Z]+-[0-9a-z]+-[0-9a-z]+$/.test(clientSecret),
        expectedClientIdFormat: 'YourApp-YourApp-PRD-1234567890-abcdefgh',
        expectedClientSecretFormat: 'PRD-1234567890abcdef-12345678'
    };

    // Test OAuth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        console.log('Testing eBay OAuth with PRODUCTION credentials...');
        
        const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/buy.browse'
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { rawResponse: responseText };
        }

        if (!response.ok) {
            console.error('eBay OAuth failed:', response.status, data);
            return NextResponse.json({
                success: false,
                status: response.status,
                credentialInfo: info,
                ebayError: data,
                rawResponse: responseText,
                possibleIssues: [
                    'Using Sandbox credentials instead of Production',
                    'Client ID or Secret is incorrect',
                    'Credentials not enabled for production',
                    'App not configured for Client Credentials grant type'
                ],
                instructions: 'Go to https://developer.ebay.com/my/keys and verify your PRODUCTION credentials',
                nextSteps: [
                    '1. Verify you copied from the PRODUCTION tab (not Sandbox)',
                    '2. Check that App ID matches: saint-Sainto-PRD-8c58beaa7-6a3fd4dc',
                    '3. Check that Cert ID starts with: PRD-c58beaa7f205',
                    '4. Make sure your app has "Client Credentials" grant type enabled'
                ]
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            message: 'eBay OAuth credentials are working!',
            credentialInfo: info,
            tokenReceived: true,
            tokenExpiresIn: data.expires_in + ' seconds'
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            credentialInfo: info
        }, { status: 500 });
    }
}