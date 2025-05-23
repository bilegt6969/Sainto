// app/api/search/route.ts
import { type NextRequest, NextResponse } from 'next/server'

const CONSTRUCT_API_KEY = process.env.CONSTRUCT_API_KEY; // Get key from environment variables
const CONSTRUCT_CLIENT_ID = 'c1a92cc3-02a4-4244-8e70-bee6178e8209'; // This can remain if it's not sensitive
const RESULTS_PER_PAGE = 24;

// Define expected API response structure (adjust based on actual API)
interface ConstructorIOResult {
    data: {
        id: string;
        slug: string;
        image_url: string;
        lowest_price_cents?: number | null;
        // Add other relevant fields you might need from data
    };
    value: string; // Product name
    // Include other fields if necessary
}

// Define a basic structure for Facets - adjust based on actual Constructor.io response
interface FacetOption {
    value: string;
    count: number;
    // Potentially other fields like 'data', 'display_name'
}

interface Facet {
    name: string;
    display_name: string;
    type: string; // e.g., 'multiple', 'range'
    options: FacetOption[];
    // Potentially 'min', 'max' for range facets
    // Add other potential fields based on your API response
}


interface ConstructorIOResponse {
    response: {
        results?: ConstructorIOResult[];
        total_num_results?: number;
        // Use the specific Facet interface instead of any[]
        facets?: Facet[]; // <-- CHANGE 1: Replaced any[] with Facet[]
    };
    // Add other potential fields if needed
}


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';
    const sortBy = searchParams.get('sort_by') || 'relevance'; // Default sort
    const sortOrder = searchParams.get('sort_order') || 'descending'; // Default order
    const recentlyReleased = searchParams.get('recently_released'); // Example filter

    if (!CONSTRUCT_API_KEY) {
        console.error("Search API key is not configured in environment variables.");
        return NextResponse.json({ error: "Search configuration error." }, { status: 500 });
    }

    if (!query) {
        return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    // --- Construct the API URL ---
    const encodedQuery = encodeURIComponent(query);
    const apiURL = new URL(`https://ac.cnstrc.com/search/${encodedQuery}`);
    apiURL.searchParams.set('c', 'ciojs-client-2.54.0'); // Example client version
    apiURL.searchParams.set('key', CONSTRUCT_API_KEY);
    apiURL.searchParams.set('i', CONSTRUCT_CLIENT_ID);
    apiURL.searchParams.set('s', '37'); // Session ID or similar, might need to be dynamic/managed
    apiURL.searchParams.set('page', page);
    apiURL.searchParams.set('num_results_per_page', String(RESULTS_PER_PAGE));
    apiURL.searchParams.set('sort_by', sortBy);
    apiURL.searchParams.set('sort_order', sortOrder);
    apiURL.searchParams.set('_dt', String(Date.now())); // Cache buster

    // Add filters dynamically
    if (recentlyReleased) {
        apiURL.searchParams.set('filters[recently_released]', recentlyReleased);
    }
    // Add other filters here based on searchParams...
    // Example: const size = searchParams.get('size'); if (size) apiURL.searchParams.set('filters[size]', size);


    // --- Add Format Options (Optional but present in your example) ---
    // These hide specific fields/facets from the response, tailor as needed
    apiURL.searchParams.append('fmt_options[hidden_fields]', 'gp_lowest_price_cents_223');
    apiURL.searchParams.append('fmt_options[hidden_fields]', 'gp_instant_ship_lowest_price_cents_223');
    apiURL.searchParams.append('fmt_options[hidden_facets]', 'gp_lowest_price_cents_223');
    apiURL.searchParams.append('fmt_options[hidden_facets]', 'gp_instant_ship_lowest_price_cents_223');

    // Variations Map (Include if necessary, might need complex handling)
    // const variationsMap = searchParams.get('variations_map') || JSON.stringify({...}); // Default or passed value
    // apiURL.searchParams.set('variations_map', variationsMap);


    // --- Fetch from External API ---
    try {
        console.log("Fetching from Constructor.io:", apiURL.toString()); // Log the URL for debugging
        const res = await fetch(apiURL.toString());

        if (!res.ok) {
            const errorBodyText = await res.text();
            let errorMsg = `Constructor.io API Error: ${res.status}`;
            try {
                const errorJson = JSON.parse(errorBodyText);
                errorMsg += ` - ${errorJson?.message || errorBodyText}`;
            } catch (parseError) {
                console.debug('Failed to parse error response as JSON', parseError);
                errorMsg += ` - ${errorBodyText}`;
            }
            console.error(errorMsg);
            return NextResponse.json({ error: "Failed to fetch search results.", details: errorMsg }, { status: res.status });
        }

        const result: ConstructorIOResponse = await res.json();

        // --- Process the response ---
        const fetchedProducts = result?.response?.results || [];
        const totalNumResults = result?.response?.total_num_results;
        // Type inference works here, facets will be Facet[] | undefined
        const facets = result?.response?.facets || []; // Get facets if available

        // Basic validation/filtering - keep products with essential data
        const validProducts = fetchedProducts.filter(p =>
            p.data?.id && p.data?.slug && p.data?.image_url && p.value
        ).map(p => ({ // Remap to ensure consistent structure if needed
             data: {
                 id: p.data.id,
                 slug: p.data.slug,
                 image_url: p.data.image_url,
                 lowest_price_cents: p.data.lowest_price_cents
             },
             value: p.value
         }));


        // Determine if more results exist
        let apiHasMore = validProducts.length === RESULTS_PER_PAGE;
        // More accurate check if total results are known
        if (totalNumResults !== undefined && parseInt(page) * RESULTS_PER_PAGE >= totalNumResults) {
            apiHasMore = false;
        }

        // Return data in the format expected by the frontend
        return NextResponse.json({
            results: validProducts,
            hasMore: apiHasMore,
            totalResults: totalNumResults,
            facets: facets, // Pass facets to the frontend
            currentPage: parseInt(page),
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown server error occurred';
        console.error("API Route Error:", message, err);
        return NextResponse.json({ error: "Server error during search.", details: message }, { status: 500 });
    }
}

// Remember to set CONSTRUCT_API_KEY in your .env.local file
// CONSTRUCT_API_KEY=key_XT7bjdbvjgECO5d8