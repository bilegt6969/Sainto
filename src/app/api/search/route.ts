import { type NextRequest, NextResponse } from 'next/server';
import { Product } from '../../../../types/product'; // Import the Product interface

const RESULTS_PER_PAGE = 24;
const KICKS_DEV_API_KEY = 'sd_j2g1pZeImx1tptjgIwpFhQE6vn2AhqG1'; // Your Kicks.dev API Key

// Updated interface for Kicks.dev GOAT API Product
interface KicksDevProduct {
  id: number;
  sku: string;
  slug: string;
  name: string; // Corresponds to 'title' in Product interface
  brand: string;
  model: string;
  description: string;
  colorway: string;
  season: string;
  category: string;
  product_type: string;
  image_url: string; // Corresponds to 'pictureUrl'
  release_date: string; // e.g., "20250121"
  release_date_year: string;
  retail_prices: {
    retail_price_cents_usd?: number; // Price in USD cents
    [key: string]: number | undefined; // Other currencies
  };
  link: string;
  sizes: Array<{
    presentation: string;
    value: number;
  }>;
  variants?: Array<{
    product_id: number;
    size: string;
    lowest_ask: number; // In USD, not cents
    available: boolean;
    currency: string;
    updated_at: string;
  }>;
}

interface KicksDevApiResponse {
  status: string; // "success" or "error"
  query?: { query: string };
  data?: KicksDevProduct[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
  error?: string; // For error responses
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('page_limit') || String(RESULTS_PER_PAGE);

  // Base URL for Kicks.dev GOAT products API (removed trailing slash)
  const apiURL = new URL('https://api.kicks.dev/v3/goat/products');

  // Add query parameters
  if (query) {
    apiURL.searchParams.set('query', query);
  }
  apiURL.searchParams.set('limit', limit);
  apiURL.searchParams.set('page', page); // Kicks.dev uses 1-indexed pages
  apiURL.searchParams.set('currency', 'USD');

  try {
    console.log('Fetching from Kicks.dev:', apiURL.toString());

    // Updated headers to match the working fetch example
    const myHeaders = new Headers();
    myHeaders.append("Authorization", KICKS_DEV_API_KEY);

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      cache: 'no-store',
    };

    const res = await fetch(apiURL.toString(), requestOptions);

    if (!res.ok) {
      const errorBodyText = await res.text();
      let errorMsg = `Kicks.dev API Error: ${res.status}`;
      try {
        const errorJson = JSON.parse(errorBodyText);
        errorMsg += ` - ${errorJson?.error || errorBodyText}`;
      } catch (parseError) {
        console.debug('Failed to parse error response as JSON', parseError);
        errorMsg += ` - ${errorBodyText}`;
      }
      console.error(errorMsg);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch search results.', details: errorMsg },
        { status: res.status }
      );
    }

    const result: KicksDevApiResponse = await res.json();

    if (result.status === 'error') {
      console.error('Kicks.dev API returned error status:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Kicks.dev API reported an error.' },
        { status: 500 }
      );
    }

    // Process the response
    const fetchedProducts = result?.data || [];
    const totalNumResults = result?.meta?.total || 0;
    const currentPage = result?.meta?.current_page || 0;
    const perPage = result?.meta?.per_page || RESULTS_PER_PAGE;

    // Map KicksDevProduct to Product interface
    const productsForFrontend = fetchedProducts.map((p): Product => {
      const hasAvailableVariant = Array.isArray(p.variants) && p.variants.some(v => v.available);
      const retailPriceUsdCents = p.retail_prices?.retail_price_cents_usd || 0;
      const lowestAskCents = Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants.reduce((minAsk, v) => Math.min(minAsk, v.lowest_ask * 100), Infinity)
        : Infinity;

      return {
        id: String(p.id),
        slug: p.slug,
        pictureUrl: p.image_url,
        title: p.name,
        localizedRetailPriceCents: {
          amountCents: retailPriceUsdCents,
          currency: 'USD',
        },
        status: 'available',
        inStock: hasAvailableVariant,
        category: p.category,
        brandName: p.brand,
        activitiesList: [],
        releaseDate: p.release_date
          ? {
              seconds: new Date(
                p.release_date.slice(0, 4) + '-' +
                p.release_date.slice(4, 6) + '-' +
                p.release_date.slice(6, 8)
              ).getTime() / 1000,
              nanos: 0
            }
          : undefined,
        seasonYear: p.release_date_year,
        productType: p.product_type,
        underRetail: retailPriceUsdCents > 0 && lowestAskCents < retailPriceUsdCents,
        gender: '',
      };
    });

    // Determine if more results exist
    const hasMore = (currentPage + 1) * perPage < totalNumResults;

    // Return data in the format expected by the frontend
    return NextResponse.json({
      success: true,
      data: {
        products: productsForFrontend,
        totalCount: totalNumResults,
        hasMore: hasMore,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown server error occurred';
    console.error('API Route Error:', message, err);
    return NextResponse.json(
      { success: false, error: 'Server error during search.', details: message },
      { status: 500 }
    );
  }
}