// app/product/[id]/page.tsx
import { Metadata } from 'next';
import ProductView from './ProductView'; 

// --- TYPE DEFINITIONS ---

// Represents the structure of a price data point for the frontend
interface PriceData {
    sizeOption?: { presentation: string; };
    lastSoldPriceCents?: { amount: number | null | undefined; };
    stockStatus: string;
    shoeCondition: string;
    boxCondition: string;
}

// Represents a product image
interface ProductImage {
    mainPictureUrl: string;
}

// Represents the normalized product data used by the ProductView component
interface Product {
    id: string;
    name: string;
    productCategory: string;
    productType: string;
    color: string;
    brandName: string;
    details: string; // SKU
    gender: string[];
    midsole: string;
    mainPictureUrl: string;
    releaseDate: string;
    slug: string;
    upperMaterial: string;
    singleGender: string;
    story: string;
    productTemplateExternalPictures?: ProductImage[];
    localizedSpecialDisplayPriceCents?: { amountUsdCents: number | null | undefined; };
}

// --- API-SPECIFIC TYPES (for type-safe data fetching) ---

// Type for a single variant coming from the external API
interface ApiVariant {
    size: string;
    lowest_ask: number;
    available: boolean;
    // Add any other properties that come from the API variant
}

// Type for the raw product data structure from the API
interface RawApiProductData {
    id: string | number;
    sku: string;
    name: string;
    category: string;
    product_type: string;
    colorway: string;
    brand: string;
    image_url: string;
    release_date: string;
    slug: string;
    description: string;
    images?: string[];
    gender: string[];
    midsole: string;
    upperMaterial: string;
    singleGender: string;
    variants: ApiVariant[];
}

// --- ADDED: Type for our simplified eBay item from /api/ebay ---
interface SimplifiedEbayItem {
    id: string;
    title: string;
    price: string; // This is a string value like "150.00"
    currency: string;
    condition: string; // e.g., "New", "Pre-owned"
    url: string;
    imageUrl: string;
}

// --- PROPS TYPE for the Page and generateMetadata functions ---
// Updated for Next.js 15 where params is now a Promise
type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


// --- DATA FETCHING HELPER (MODIFIED WITH FALLBACK LOGIC) ---
async function getProductData(slug: string) {
    const host = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    
    let apiProductData: RawApiProductData | null = null;
    let ebayItems: SimplifiedEbayItem[] = []; // Store eBay results

    try {
        // --- Step 1: Attempt to fetch from the primary (KicksDB) API ---
        const response = await fetch(`${host}/api/hey?slug=${slug}`, {
            next: { revalidate: 3600 }
        });

        // --- !! PRIMARY API FAILED (e.g., 500 Error) !! ---
        if (!response.ok) {
            console.warn(`Primary API failed (${response.status}). Assuming '${slug}' is an eBay item slug.`);

            // --- FIX: Extract the Item ID from the slug ---
            // Slug format: "some-title-with-dashes-ITEMID|OTHERID"
            // We decode, split by '|', and get the first part.
            const mainPart = decodeURIComponent(slug).split('|')[0];
            // We find the trailing number (the Item ID)
            const match = mainPart.match(/(\d+)$/);
            const ebayItemId = match ? match[1] : null;

            if (!ebayItemId) {
                console.error(`Could not parse eBay Item ID from slug: ${slug}`);
                return null;
            }

            console.log(`Fallback: Fetching eBay item ID: ${ebayItemId}`);
            
            // --- FIX: Call the NEW /api/ebay/item route ---
            const ebayResponse = await fetch(`${host}/api/ebay/item?itemId=${ebayItemId}`, {
                next: { revalidate: 3600 }
            });
            
            if (!ebayResponse.ok) {
                // If the new route fails (e.g., item not found, auth error)
                console.error(`eBay item fallback API fetch failed with status: ${ebayResponse.status}.`);
                return null;
            }

            const ebayResult = await ebayResponse.json();
            const mainEbayItem: SimplifiedEbayItem = ebayResult.item;

            if (!mainEbayItem) {
                console.error(`eBay item fallback API returned no item for ID: ${ebayItemId}`);
                return null;
            }
            
            // --- BUILD A "FAKE" PRODUCT FROM THE SINGLE EBAY ITEM ---
            // Since we only fetched one item, we use it for everything.
            // We put it in an array to re-use your existing PriceData logic.
            ebayItems = [mainEbayItem]; 

            const product: Product = {
                id: mainEbayItem.id,
                name: mainEbayItem.title,
                productCategory: 'eBay',
                productType: mainEbayItem.condition,
                color: 'N/A',
                brandName: 'eBay Listing',
                details: `eBay ID: ${mainEbayItem.id}`,
                mainPictureUrl: mainEbayItem.imageUrl,
                releaseDate: '',
                slug: slug,
                story: `This is an eBay listing for "${mainEbayItem.title}". Condition: ${mainEbayItem.condition}.`,
                productTemplateExternalPictures: [{ mainPictureUrl: mainEbayItem.imageUrl }],
                gender: [],
                midsole: 'N/A',
                upperMaterial: 'N/A',
                singleGender: 'N/A',
                localizedSpecialDisplayPriceCents: { amountUsdCents: Math.round(parseFloat(mainEbayItem.price) * 100) }
            };

            // Transform this SINGLE eBay item into PriceData
            const ebayPriceData: PriceData[] = ebayItems
                .filter(item => item.price && item.currency === 'USD')
                .map((item: SimplifiedEbayItem) => ({
                    sizeOption: { presentation: `eBay (${item.condition}) - $${item.price}` },
                    lastSoldPriceCents: { amount: Math.round(parseFloat(item.price) * 100) },
                    stockStatus: 'in_stock',
                    shoeCondition: item.condition.toLowerCase().includes('new') ? 'new_no_defects' : 'pre_owned',
                    boxCondition: 'unknown',
                }));
            
            return { product, priceData: ebayPriceData, recommendedProducts: [] };
        }
        
        // --- IF KicksDB API SUCCEEDED (Original Logic) ---
        // ... (The rest of your original logic for the successful primary API call) ...
        // ... (This includes the part that fetches from /api/ebay for recommendations) ...
        
        const result = await response.json();
        apiProductData = result.data?.data; 

        if (!apiProductData) {
            console.error("No product data found in primary API response for slug:", slug);
            return null;
        }

        // --- Step 2: Fetch from eBay API (using /api/ebay search) for *recommendations* ---
        const productName = apiProductData.name;
        if (productName) {
            try {
                // This still uses your ORIGINAL /api/ebay route to get *related* items
                const ebayResponse = await fetch(`${host}/api/ebay?query=${encodeURIComponent(productName)}`, {
                    next: { revalidate: 3600 } 
                });
                
                if (ebayResponse.ok) {
                    const ebayResult = await ebayResponse.json();
                    ebayItems = ebayResult.items || []; 
                } else {
                    console.warn(`eBay search API fetch failed: ${ebayResponse.status}.`);
                }
            } catch (ebayError) {
                console.warn("Error fetching from eBay search API:", ebayError);
            }
        }

        // --- Step 3: Transform Primary API Data (Original Logic) ---
        const product: Product = {
            id: String(apiProductData.id || apiProductData.sku || ''),
            name: apiProductData.name || 'Unnamed Product',
            // ... (rest of your product mapping) ...
            productCategory: apiProductData.category || 'N/A',
            productType: apiProductData.product_type || 'N/A',
            color: apiProductData.colorway || 'N/A',
            brandName: apiProductData.brand || 'N/A',
            details: apiProductData.sku || 'N/A',
            mainPictureUrl: apiProductData.image_url || '/placeholder.png', 
            releaseDate: apiProductData.release_date || '',
            slug: apiProductData.slug || slug,
            story: apiProductData.description || '',
            productTemplateExternalPictures: apiProductData.images?.map((url: string) => ({ mainPictureUrl: url })) || [],
            gender: apiProductData.gender || [],
            midsole: apiProductData.midsole || '',
            upperMaterial: apiProductData.upperMaterial || '',
            singleGender: apiProductData.singleGender || '',
            localizedSpecialDisplayPriceCents: { amountUsdCents: null }
        };

        // --- Step 4: Transform variants from the primary API (Original Logic) ---
        const primaryPriceData: PriceData[] = (apiProductData.variants || [])
            .filter((variant: ApiVariant) => variant.available && variant.lowest_ask > 0)
            .map((variant: ApiVariant) => ({
                sizeOption: { presentation: variant.size },
                lastSoldPriceCents: { amount: variant.lowest_ask * 100 },
                stockStatus: 'multiple_in_stock',
                shoeCondition: 'new_no_defects',
                boxCondition: 'good_condition',
            }));
        
        // --- Step 5: Transform eBay API Data (Original Logic) ---
        const ebayPriceData: PriceData[] = ebayItems
            .filter(item => item.price && item.currency === 'USD')
            .map((item: SimplifiedEbayItem) => ({
                sizeOption: { presentation: `eBay (${item.condition}) - $${item.price}` },
                lastSoldPriceCents: { amount: Math.round(parseFloat(item.price) * 100) },
                stockStatus: 'in_stock',
                shoeCondition: item.condition.toLowerCase().includes('new') ? 'new_no_defects' : 'pre_owned',
                boxCondition: 'unknown',
            }));

        // --- Step 6: Merge Data Sources (Original Logic) ---
        const combinedPriceData = [...primaryPriceData, ...ebayPriceData];

        const recommendedProducts: Product[] = []; 
        
        return { product, priceData: combinedPriceData, recommendedProducts };

    } catch (error) {
        console.error("An error occurred in getProductData:", error);
        return null;
    }
}


// --- METADATA (Runs on the server) ---
// (No changes needed, this will work with the modified getProductData)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const data = await getProductData(id);

    if (!data?.product.name) {
        return { title: 'Product Not Found' };
    }

    return {
        title: `${data.product.name} | ${data.product.brandName}`,
        description: data.product.story
    };
}

// --- PAGE COMPONENT (Runs on the server) ---
// (No changes needed, this will work with the modified getProductData)
export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const data = await getProductData(id);

    if (!data) {
        // A simple, clean message if the product isn't found
        return (
            <div className="flex items-center justify-center h-screen bg-white text-neutral-500">
                <div className="text-center p-10 bg-gray-100 rounded-lg shadow-xl">
                    <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                    <p>Sorry, we couldn&apos;t find the product you were looking for.</p>
                </div>
            </div>
        );
    }
    
    // The ProductView component receives the fully typed, clean data
    return (
        <ProductView
            product={data.product}
            priceData={data.priceData} // This prop now contains the merged data
            recommendedProducts={data.recommendedProducts}
        />
    );
}


