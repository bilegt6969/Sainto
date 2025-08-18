// File: app/api/collections/[slug]/route.ts
import { type NextRequest, NextResponse } from 'next/server.js';
import { client, getProductCollectionQuery } from '../../../../../lib/sanity';

// --- Interfaces ---

// Structure of individual products from Sanity's rawProductJson
interface SanityProductData {
    pictureUrl: string;
    title: string;
    slug: string;
    price: number;
    collection?: string;
}

// Structure of the parsed JSON from Sanity
interface SanityRawData {
    // ✅ FIXED: Replaced `any` with `unknown` for better type safety.
    // `unknown` is a safer alternative when the type isn't known beforehand.
    summary?: unknown;
    products: SanityProductData[];
}

// Structure of the Sanity document
interface SanityCollection {
    _id: string;
    name: string;
    slug: {
        current: string;
    };
    rawProductJson: string;
    order: number;
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
    slug: string; // Product-specific slug for linking
    price: number;
    collection?: string;
}

// Structure of the overall response THIS API route returns (exported for frontend use)
export interface ApiResponse {
    products: ApiProduct[];
    collectionName: string;
    collectionSlug: string;
    hasMore: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
    error?: string; // Optional error field
}

// --- Constants ---
const RESULTS_PER_PAGE = 24;

// ✅ FIXED: Exporting this constant as `revalidate` tells Next.js
// how often to cache this route (in seconds). This fixes the "unused variable"
// error and correctly implements caching.
export const revalidate = 300; // Cache for 5 minutes

// --- Helper Functions ---

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
 * Converts Sanity product data to our API format
 */
function transformSanityProduct(item: SanityProductData, index: number): ApiProduct {
    return {
        id: item.slug || `product-${index}`, // Use slug as ID, fallback to index-based ID
        name: item.title,
        image: item.pictureUrl,
        slug: item.slug,
        price: item.price || 0,
        collection: item.collection,
    };
}

/**
 * Paginates an array of products
 */
function paginateProducts(products: ApiProduct[], page: number, perPage: number) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const totalPages = Math.ceil(products.length / perPage);
    const hasMore = page < totalPages;

    return {
        products: paginatedProducts,
        hasMore,
        totalPages,
        total: products.length
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

        // 2. Validate Slug
        if (!slug || typeof slug !== 'string') {
            console.error('Invalid or missing slug parameter:', slug);
            return NextResponse.json({
                products: [],
                collectionName: '',
                collectionSlug: '',
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: 'Slug parameter is missing or invalid'
            }, { status: 400 });
        }

        console.log(`Fetching collection "${slug}" from Sanity, page ${pageNum}...`);

        // 3. Fetch from Sanity
        const collection: SanityCollection = await client.fetch(
            getProductCollectionQuery,
            { slug }
        );

        // 4. Check if collection exists
        if (!collection) {
            console.warn(`Collection with slug "${slug}" not found in Sanity`);
            return NextResponse.json({
                products: [],
                collectionName: '',
                collectionSlug: slug,
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: `Collection "${slug}" not found`
            }, { status: 404 });
        }

        // 5. Parse the rawProductJson
        let parsedProducts: SanityProductData[] = [];
        try {
            const rawData: SanityRawData = JSON.parse(collection.rawProductJson);
            if (rawData && Array.isArray(rawData.products)) {
                parsedProducts = rawData.products;
            } else {
                throw new Error('Invalid product data structure');
            }
        } catch (parseError) {
            console.error(`Failed to parse rawProductJson for collection "${slug}":`, parseError);
            return NextResponse.json({
                products: [],
                collectionName: collection.name,
                collectionSlug: collection.slug.current,
                hasMore: false,
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                error: 'Invalid product data format in collection'
            }, { status: 422 });
        }

        // 6. Transform Products
        const allProducts: ApiProduct[] = parsedProducts.map(transformSanityProduct);

        // 7. Apply Pagination
        const paginationResult = paginateProducts(allProducts, pageNum, RESULTS_PER_PAGE);

        console.log(`Successfully fetched ${paginationResult.products.length} products for "${slug}" (Page: ${pageNum}/${paginationResult.totalPages})`);

        // 8. Return Success Response
        return NextResponse.json({
            products: paginationResult.products,
            collectionName: collection.name,
            collectionSlug: collection.slug.current,
            hasMore: paginationResult.hasMore,
            total: paginationResult.total,
            currentPage: pageNum,
            totalPages: paginationResult.totalPages,
        });

    } catch (error: unknown) {
        console.error(`Error in API route handler for slug [${slug ?? 'unknown'}] (Page: ${pageNum}):`, error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';

        return NextResponse.json({
            products: [],
            collectionName: '',
            collectionSlug: slug || '',
            hasMore: false,
            total: 0,
            currentPage: pageNum,
            totalPages: 0,
            error: message
        }, { status: 500 });
    }
}

// Health check endpoint
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