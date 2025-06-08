import { Metadata } from 'next';
import ProductView from './ProductView'; // Assuming this component exists and accepts the props

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

// --- PROPS TYPE for the Page and generateMetadata functions ---
// Updated for Next.js 15 where params is now a Promise
type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


// --- DATA FETCHING HELPER (Runs on the server) ---
async function getProductData(slug: string) {
    // Construct the full URL for server-side fetching
    const host = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    
    try {
        const response = await fetch(`${host}/api/hey?slug=${slug}`, {
            // Revalidate the data every hour
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            console.error(`API fetch failed with status: ${response.status} for slug: ${slug}`);
            return null;
        }

        const result = await response.json();
        
        // Safely access the nested product data
        const apiProductData: RawApiProductData = result.data?.data;

        if (!apiProductData) {
            console.error("No product data found in API response for slug:", slug);
            return null;
        };

        // --- TRANSFORM API DATA TO FRONTEND-READY DATA ---

        const product: Product = {
            id: String(apiProductData.id || apiProductData.sku || ''),
            name: apiProductData.name || 'Unnamed Product',
            productCategory: apiProductData.category || 'N/A',
            productType: apiProductData.product_type || 'N/A',
            color: apiProductData.colorway || 'N/A',
            brandName: apiProductData.brand || 'N/A',
            details: apiProductData.sku || 'N/A',
            mainPictureUrl: apiProductData.image_url || '/placeholder.png', // Provide a fallback image
            releaseDate: apiProductData.release_date || '',
            slug: apiProductData.slug || slug,
            story: apiProductData.description || '',
            productTemplateExternalPictures: apiProductData.images?.map((url: string) => ({ mainPictureUrl: url })) || [],
            gender: apiProductData.gender || [],
            midsole: apiProductData.midsole || '',
            upperMaterial: apiProductData.upperMaterial || '',
            singleGender: apiProductData.singleGender || '',
            localizedSpecialDisplayPriceCents: { amountUsdCents: null } // Default value
        };

        const priceData: PriceData[] = (apiProductData.variants || [])
            .filter((variant: ApiVariant) => variant.available && variant.lowest_ask > 0)
            .map((variant: ApiVariant) => ({
                sizeOption: { presentation: variant.size },
                lastSoldPriceCents: { amount: variant.lowest_ask * 100 }, // Convert dollars to cents
                stockStatus: 'multiple_in_stock',
                shoeCondition: 'new_no_defects',
                boxCondition: 'good_condition',
            }));
        
        // Placeholder for a real recommendation engine
        const recommendedProducts: Product[] = []; 
        
        return { product, priceData, recommendedProducts };

    } catch (error) {
        console.error("An error occurred in getProductData:", error);
        return null;
    }
}


// --- METADATA (Runs on the server) ---
// Updated to await the params Promise
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
// Updated to await the params Promise
export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const data = await getProductData(id);

    if (!data) {
        // A simple, clean message if the product isn't found
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center p-10 bg-gray-800 rounded-lg shadow-xl">
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
            priceData={data.priceData}
            recommendedProducts={data.recommendedProducts}
        />
    );
}