    // app/api/ebay/route.ts
    import { NextRequest, NextResponse } from 'next/server';

    /**
     * eBay Finding API types (complex nested structure)
     */
    interface EbayItem {
        itemId: string[];
        title: string[];
        galleryURL?: string[];
        viewItemURL: string[];
        sellingStatus: {
            currentPrice: {
                '@currencyId': string;
                __value__: string;
            }[];
        }[];
        condition?: {
            conditionDisplayName: string[];
        }[];
    }

    interface EbaySearchResult {
        item?: EbayItem[];
    }

    interface EbayFindItemsResponse {
        findItemsByKeywordsResponse?: {
            ack: string[];
            searchResult: EbaySearchResult[];
        }[];
    }

    // Simplified item structure
    interface SimplifiedEbayItem {
        id: string;
        title: string;
        price: string;
        currency: string;
        condition: string;
        url: string;
        imageUrl: string;
    }

    export async function GET(request: NextRequest) {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const EBAY_APP_ID = process.env.EBAY_PRODUCTION_CLIENT_ID;

        if (!EBAY_APP_ID) {
            console.error('eBay App ID is not set in environment variables.');
            return NextResponse.json(
                { error: 'Server configuration error: eBay App ID missing.' },
                { status: 500 }
            );
        }

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required.' },
                { status: 400 }
            );
        }

        console.log('Searching eBay for:', query);

        // Construct the eBay Finding API URL
        const endpoint = new URL('https://svcs.ebay.com/services/search/FindingService/v1');
        endpoint.searchParams.set('OPERATION-NAME', 'findItemsByKeywords');
        endpoint.searchParams.set('SERVICE-VERSION', '1.0.0');
        endpoint.searchParams.set('SECURITY-APPNAME', EBAY_APP_ID);
        endpoint.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON');
        endpoint.searchParams.set('REST-PAYLOAD', 'true');
        endpoint.searchParams.set('keywords', query);
        endpoint.searchParams.set('paginationInput.entriesPerPage', '10');
        endpoint.searchParams.set('sortOrder', 'PricePlusShippingLowest');

        try {
            const response = await fetch(endpoint.toString(), {
                next: { revalidate: 3600 }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('eBay Finding API Error:', response.status, errorText);
                throw new Error(`eBay API request failed: ${response.status}`);
            }

            const data: EbayFindItemsResponse = await response.json();

            // Extract items from complex response structure
            const items: EbayItem[] = data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || [];

            console.log(`Found ${items.length} items for query: ${query}`);

            // Simplify the data structure
            const simplifiedItems: SimplifiedEbayItem[] = items.map(item => ({
                id: item.itemId[0],
                title: item.title[0],
                price: item.sellingStatus[0].currentPrice[0].__value__,
                currency: item.sellingStatus[0].currentPrice[0]['@currencyId'],
                condition: item.condition?.[0]?.conditionDisplayName[0] || 'Unknown',
                url: item.viewItemURL[0],
                imageUrl: item.galleryURL?.[0] || '/placeholder.png',
            }));

            return NextResponse.json({ items: simplifiedItems });

        } catch (error) {
            console.error('Error fetching from eBay Finding API:', error);
            return NextResponse.json(
                { error: 'Failed to fetch data from eBay.' },
                { status: 500 }
            );
        }
    }