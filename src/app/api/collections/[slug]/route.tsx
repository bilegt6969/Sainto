// File: app/api/collections/[slug]/route.ts
import { type NextRequest, NextResponse } from 'next/server.js'; // Import NextRequest if needed for searchParams

// --- Environment Variable Setup ---
// Ensure these are in your .env.local and added to .gitignore
// CONSTRUCT_API_KEY=key_XT7bjdbvjgECO5d8
// CONSTRUCT_CLIENT_ID=c1a92cc3-02a4-4244-8e70-bee6178e8209

const apiKey = process.env.CONSTRUCT_API_KEY;
const clientId = process.env.CONSTRUCT_CLIENT_ID;

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
    // Add other potential fields from the actual API response if needed
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
    error?: string; // Optional error field (expects string or undefined)
}

// --- Constants ---
const RESULTS_PER_PAGE = 24;
// !!! CRITICAL VERIFICATION NEEDED !!!
// Verify 's=86' is the correct search type parameter for the 'collection_id/{slug}' endpoint.
// Consult the Construct API documentation. Incorrect 's' value will lead to errors or wrong data.
const S_PARAMETER = '86';
// Cache revalidation time in seconds (e.g., 300 = 5 minutes)
// Use 0 for no caching (equivalent to 'no-store'), or a higher value if data changes infrequently.
const CACHE_REVALIDATE_SECONDS = 300; // Cache for 5 minutes

// --- API Route Handler (Updated for Next.js 15+) ---
export async function GET(
    request: NextRequest, // Using NextRequest to easily access searchParams
    { params }: { params: Promise<ResolvedParams> } // params is now a Promise
): Promise<NextResponse<ApiResponse>> {

    let slug: string | undefined; // Define slug variable here
    let pageNum: number = 1; // Define pageNum with default

    try {
        // 1. Await and Extract Parameters
        const resolvedParams = await params; // Await the params Promise
        slug = resolvedParams.slug; // Get slug from resolved params

        const searchParams = request.nextUrl.searchParams; // Get search parameters
        const pageQuery = searchParams.get('page');
        // Assign parsed page number, default to 1 if invalid/missing
        pageNum = pageQuery ? parseInt(pageQuery, 10) : 1;
        if (isNaN(pageNum) || pageNum < 1) {
            console.warn(`Invalid page parameter received: "${pageQuery}". Defaulting to page 1.`);
            pageNum = 1; // Default to 1 if invalid
        }


        // 2. Check Credentials (Moved after resolving params for better error logging)
        if (!apiKey || !clientId) {
            console.error('API Key or Client ID missing in environment variables.');
            return NextResponse.json({
                products: [], hasMore: false, total: 0, error: 'Server configuration error: Missing API credentials.'
            }, { status: 500 });
        }

        // 3. Validate Slug (Page number validated above)
        if (!slug || typeof slug !== 'string') {
            console.error('Invalid or missing slug parameter:', slug);
            return NextResponse.json({ products: [], hasMore: false, total: 0, error: 'Slug parameter is missing or invalid' }, { status: 400 });
        }

        // 4. Construct External API URL
        // Note: Carefully review ALL parameters against the Construct API documentation.
        const apiUrl = `https://ac.cnstrc.com/browse/collection_id/${slug}?c=ciojs-client-2.54.0&key=${apiKey}&i=${clientId}&s=${S_PARAMETER}&page=${pageNum}&num_results_per_page=${RESULTS_PER_PAGE}&sort_by=relevance&sort_order=descending&fmt_options%5Bhidden_fields%5D=gp_lowest_price_cents_223&fmt_options%5Bhidden_fields%5D=gp_instant_ship_lowest_price_cents_223&fmt_options%5Bhidden_facets%5D=gp_lowest_price_cents_223&fmt_options%5Bhidden_facets%5D=gp_instant_ship_lowest_price_cents_223&variations_map=%7B%22group_by%22%3A%5B%7B%22name%22%3A%22product_condition%22%2C%22field%22%3A%22data.product_condition%22%7D%2C%7B%22name%22%3A%22box_condition%22%2C%22field%22%3A%22data.box_condition%22%7D%5D%2C%22values%22%3A%7B%22min_regional_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.gp_lowest_price_cents_223%22%7D%2C%22min_regional_instant_ship_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.gp_instant_ship_lowest_price_cents_223%22%7D%7D%2C%22dtype%22%3A%22object%22%7D&qs=%7B%22features%22%3A%7B%22display_variations%22%3Atrue%7D%2C%22feature_variants%22%3A%7B%22display_variations%22%3A%22matched%22%7D%7D&_dt=${Date.now()}`;

        // 5. Fetch from External API with Revalidation Caching
        console.log(`Fetching external API for slug "${slug}", page ${pageNum}...`);
        const res = await fetch(apiUrl, { next: { revalidate: CACHE_REVALIDATE_SECONDS } });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`External API Error for slug "${slug}" (Page: ${pageNum}): Status ${res.status}, URL: ${apiUrl.substring(0, 200)}... Response: ${errorText.substring(0, 200)}...`);
            // Return error in standard structure
            return NextResponse.json({
                products: [], hasMore: false, total: 0, error: `External API failed with status: ${res.status}. Check server logs for details.`
            }, { status: res.status }); // Use external API status if informative
        }

        const data: ExternalApiResponse = await res.json();

        // 6. Process Response
        if (!data.response || !Array.isArray(data.response.results)) {
            console.warn(`Invalid data structure received for slug "${slug}" (Page: ${pageNum}). Expected response.results array. URL: ${apiUrl.substring(0, 200)}...`);
            return NextResponse.json({
                products: [], hasMore: false, total: 0, error: 'Received invalid data structure from external API.'
            }, { status: 422 }); // 422 Unprocessable Entity might be appropriate
        }

        // Map to ApiProduct format
        const products: ApiProduct[] = data.response.results.map((item): ApiProduct => {
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
                // Use API's product slug if available, fallback to ID
                slug: item.data.slug || item.data.id,
            };
        });

        // Calculate pagination
        const totalResults = data.response.total_num_results || 0;
        const hasMore = (pageNum * RESULTS_PER_PAGE) < totalResults;

        // 7. Return Success Response
        return NextResponse.json({
            products,
            hasMore,
            total: totalResults,
            // error: null, // <<< REMOVED: Omit 'error' field entirely on success
                           // This makes it 'undefined' which matches 'string | undefined'
        });

    } catch (error: unknown) {
        // Catch fetch, JSON parsing, or processing errors
        // Log slug if it was successfully resolved before the error occurred
        console.error(`Error in API route handler for slug [${slug ?? 'unknown'}] (Page: ${pageNum}):`, error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        return NextResponse.json({ products: [], hasMore: false, total: 0, error: message }, { status: 500 });
    }
}

// You might also need POST, PUT, DELETE handlers depending on your API needs
// export async function POST(request: Request) { ... }
