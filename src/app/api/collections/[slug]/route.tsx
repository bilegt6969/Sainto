// File: app/api/collections/[slug]/route.ts
import { type NextRequest, NextResponse } from 'next/server.js';

// --- Environment Variable Setup ---
// Ensure these are in your .env.local and added to .gitignore
// CONSTRUCT_API_KEY=key_XT7bjdbvjgECO5d8
// CONSTRUCT_CLIENT_ID=c1a92cc3-02a4-4244-8e70-bee6178e8209

const apiKey = process.env.CONSTRUCT_API_KEY || "key_XT7bjdbvjgECO5d8";
const clientId = process.env.CONSTRUCT_CLIENT_ID || "c1a92cc3-02a4-4244-8e70-bee6178e8209";
const instanceId = process.env.CONSTRUCT_INSTANCE_ID || "c1d97a88-ed1d-4eff-bf4c-d2d9caa488c0";

// --- Interfaces ---

// Structure from the external Construct API
interface ExternalProductData {
    id: string;
    image_url: string;
    gp_lowest_price_cents_223?: number; // Price in cents
    gp_instant_ship_lowest_price_cents_223?: number; // Optional instant ship price in cents
    product_condition: string;
    box_condition: string;
    slug?: string; // Product's own slug from the API
}

interface ExternalProduct {
    data: ExternalProductData;
    value: string; // Product name
}

interface ExternalApiResponse {
    response: {
        results: ExternalProduct[];
        total_num_results: number;
    };
}

// Define the expected structure for the *resolved* params (after awaiting)
interface ResolvedParams {
    slug: string; // e.g., "sneaker-release-roundup"
}

// Structure of the product data THIS API route returns (exported for frontend use)
export interface ApiProduct {
    id: string;
    name: string;
    image: string;
    price: number; // Price converted to DOLLARS
    instantShipPrice: number | null; // Price converted to DOLLARS, or null
    productCondition: string;
    boxCondition: string;
    slug: string; // Product-specific slug for linking
}

// Structure of the overall response THIS API route returns (exported for frontend use)
export interface ApiResponse {
    products: ApiProduct[];
    hasMore: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
    error?: string; // Optional error field
}

// --- Constants ---
const RESULTS_PER_PAGE = 24;
const SEARCH_TYPE = '16'; // Based on your original URL
const CACHE_REVALIDATE_SECONDS = 300; // Cache for 5 minutes
const CLIENT_VERSION = 'ciojs-client-2.54.0';

// --- Helper Functions ---

/**
 * Constructs the external API URL with proper parameters
 */
function buildApiUrl(slug: string, page: number): string {
    const baseUrl = 'https://ac.cnstrc.com/browse/collection_id';
    
    // URL parameters extracted from your original API call
    const params = new URLSearchParams({
        'c': CLIENT_VERSION,
        'key': apiKey,
        'i': instanceId,
        's': SEARCH_TYPE,
        'page': page.toString(),
        'num_results_per_page': RESULTS_PER_PAGE.toString(),
        'sort_by': 'relevance',
        'sort_order': 'descending',
        'fmt_options[hidden_fields]': 'gp_lowest_price_cents_223',
        'fmt_options[hidden_facets]': 'gp_lowest_price_cents_223',
        '_dt': Date.now().toString()
    });

    // Add the complex variations_map parameter
    const variationsMap = {
        "group_by": [
            {
                "name": "product_condition",
                "field": "data.product_condition"
            },
            {
                "name": "box_condition",
                "field": "data.box_condition"
            }
        ],
        "values": {
            "min_regional_price": {
                "aggregation": "min",
                "field": "data.gp_lowest_price_cents_223"
            },
            "min_regional_instant_ship_price": {
                "aggregation": "min",
                "field": "data.gp_instant_ship_lowest_price_cents_223"
            }
        },
        "dtype": "object"
    };

    const queryString = {
        "features": {
            "display_variations": true
        },
        "feature_variants": {
            "display_variations": "matched"
        }
    };

    params.append('variations_map', JSON.stringify(variationsMap));
    params.append('qs', JSON.stringify(queryString));

    // Add multiple hidden fields for instant ship pricing
    params.append('fmt_options[hidden_fields]', 'gp_instant_ship_lowest_price_cents_223');
    params.append('fmt_options[hidden_facets]', 'gp_instant_ship_lowest_price_cents_223');

    return `${baseUrl}/${slug}?${params.toString()}`;
    console.log(baseUrl + slug + params.toString())
}

/**
 * Validates and sanitizes the page number
 */
function validatePageNumber(pageQuery: string | null): number {
    if (!pageQuery) return 1;
    
    const pageNum = parseInt(pageQuery, 10);
    if (isNaN(pageNum) || pageNum < 1) {
        console.warn(`Invalid page parameter received: "${pageQuery}". Defaulting to page 1.`);
        return 1;
    }
    
    return pageNum;
}

/**
 * Converts external product data to our API format
 */
function transformProduct(item: ExternalProduct): ApiProduct {
    // Convert price from cents to DOLLARS, default to 0 if missing/invalid
    const priceInDollars = typeof item.data.gp_lowest_price_cents_223 === 'number'
        ? item.data.gp_lowest_price_cents_223 / 100
        : 0;

    // Convert instant ship price to DOLLARS, null if missing/invalid
    const instantShipPriceInDollars = typeof item.data.gp_instant_ship_lowest_price_cents_223 === 'number'
        ? item.data.gp_instant_ship_lowest_price_cents_223 / 100
        : null;

    return {
        id: item.data.id,
        name: item.value,
        image: item.data.image_url,
        price: priceInDollars,
        instantShipPrice: instantShipPriceInDollars,
        productCondition: item.data.product_condition,
        boxCondition: item.data.box_condition,
        slug: item.data.slug || item.data.id,
    };
}

// --- API Route Handler ---
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<ResolvedParams> }
): Promise<NextResponse<ApiResponse>> {

    let slug: string | undefined;
    let pageNum: number = 1;

    try {
        // 1. Resolve Parameters
        const resolvedParams = await params;
        slug = resolvedParams.slug;

        const searchParams = request.nextUrl.searchParams;
        const pageQuery = searchParams.get('page');
        pageNum = validatePageNumber(pageQuery);

        // 2. Validate Credentials
        if (!apiKey || !clientId || !instanceId) {
            console.error('Missing API credentials in environment variables.');
            return NextResponse.json({
                products: [],
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: 'Server configuration error: Missing API credentials.'
            }, { status: 500 });
        }

        // 3. Validate Slug
        if (!slug || typeof slug !== 'string') {
            console.error('Invalid or missing slug parameter:', slug);
            return NextResponse.json({
                products: [],
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: 'Slug parameter is missing or invalid'
            }, { status: 400 });
        }

        // 4. Build API URL
        const apiUrl = buildApiUrl(slug, pageNum);
        console.log(apiUrl)
        console.log(`Fetching collection "${slug}", page ${pageNum}...`);

        // 5. Fetch from External API
        const res = await fetch(apiUrl, {
            next: { revalidate: CACHE_REVALIDATE_SECONDS },
            headers: {
                'Accept': 'application/json',
                'User-Agent': `NextJS-App/${CLIENT_VERSION}`
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`External API Error for slug "${slug}" (Page: ${pageNum}): Status ${res.status}`, errorText.substring(0, 200));
            
            return NextResponse.json({
                products: [],
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: `External API failed with status: ${res.status}`
            }, { status: res.status >= 500 ? res.status : 502 });
        }

        const data: ExternalApiResponse = await res.json();

        // 6. Validate Response Structure
        if (!data.response || !Array.isArray(data.response.results)) {
            console.warn(`Invalid data structure received for slug "${slug}" (Page: ${pageNum})`);
            return NextResponse.json({
                products: [],
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: 'Received invalid data structure from external API.'
            }, { status: 422 });
        }

        // 7. Transform Products
        const products: ApiProduct[] = data.response.results.map(transformProduct);

        // 8. Calculate Pagination
        const totalResults = data.response.total_num_results || 0;
        const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
        const hasMore = pageNum < totalPages;

        console.log(`Successfully fetched ${products.length} products for "${slug}" (Page: ${pageNum}/${totalPages})`);

        // 9. Return Success Response
        return NextResponse.json({
            products,
            hasMore,
            total: totalResults,
            currentPage: pageNum,
            totalPages,
        });

    } catch (error: unknown) {
        console.error(`Error in API route handler for slug [${slug ?? 'unknown'}] (Page: ${pageNum}):`, error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        
        return NextResponse.json({
            products: [],
            hasMore: false,
            total: 0,
            currentPage: pageNum,
            totalPages: 0,
            error: message
        }, { status: 500 });
    }
}

// Health check endpoint (optional)
export async function HEAD(
    request: NextRequest,
    { params }: { params: Promise<ResolvedParams> }
): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        if (!resolvedParams.slug) {
            return NextResponse.json({}, { status: 400 });
        }
        return NextResponse.json({}, { status: 200 });
    } catch {
        return NextResponse.json({}, { status: 500 });
    }
}