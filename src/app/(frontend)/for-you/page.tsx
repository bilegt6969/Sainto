'use client'

import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// --- Interface Definitions ---

interface ItemData {
    id: string
    slug: string
    image_url: string
    lowest_price_cents: number // Still represents USD cents from the base API
}

interface Item {
    data: ItemData
    value: string // Product name
}

interface ApiProduct {
    id: string
    name: string
    image: string
    price: number // Assuming this is USD price *before* conversion to cents
    slug: string
}

interface ApiResponse {
    products: ApiProduct[]
    hasMore: boolean
    total: number
    error?: string
}

// --- In-Memory Cache Implementation (Moved outside component) ---
interface HomeCache {
    mntRate: number | null;
    timestamp: number | null; // Timestamp for cache validation
}

// Define cache object OUTSIDE the component scope
// FIX 1: Use const instead of let
const homeCache: HomeCache = {
    mntRate: null,
    timestamp: null
};

// Define how long the cache is considered valid (e.g., 60 minutes for currency)
const CACHE_DURATION_MS = 60 * 60 * 1000;

// Helper function to check cache validity
const isCacheValid = (cacheTimestamp: number | null): boolean => {
    if (!cacheTimestamp) return false;
    return (Date.now() - cacheTimestamp) < CACHE_DURATION_MS;
};


// --- Helper Utility Functions ---

// Modified price formatter to use MNT rate
const renderPrice = (priceCentsUSD: number, mntRate: number | null): string => {
    if (typeof priceCentsUSD !== 'number' || isNaN(priceCentsUSD)) {
        return 'N/A';
    }
    if (mntRate === null || typeof mntRate !== 'number' || isNaN(mntRate)) {
        return '...'; // Indicate price is loading or unavailable
    }

    const priceDollarsUSD = priceCentsUSD / 100;
    const priceMNT = priceDollarsUSD * mntRate;

    // Format to MNT currency.
    return priceMNT.toLocaleString('en-US', { // locale can be 'mn-MN' but 'en-US' often has better support for currency symbols universally
        style: 'currency',
        currency: 'MNT',
        maximumFractionDigits: 0, // MNT typically doesn't use fractional parts
    });
};

// Basic text replacer (Implement specific logic if needed)
const replaceText = (text: string): string => {
    return text;
};


// --- Skeleton Loading Component ---
const SkeletonCard = () => (
    <div className="text-white bg-neutral-800 border border-neutral-700 rounded tracking-tight relative h-full flex flex-col animate-pulse">
        <div className="overflow-hidden rounded rounded-b-none relative flex-grow bg-neutral-700" style={{ aspectRatio: '1 / 1' }}></div>
        <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative">
            <div className="h-4 bg-neutral-600 rounded w-3/4 mr-4"></div>
            <div className="h-8 w-[90px] bg-neutral-600 rounded-full"></div>
        </div>
    </div>
);


// --- Memoized Product Card Component ---
interface ProductCardProps {
    item: Item;
    priority: boolean;
    mntRate: number | null; // Pass the rate down
}

const ProductCard = memo(({ item, priority, mntRate }: ProductCardProps) => {
    return (
        <Link href={`/product/${item.data.slug}`} passHref>
            <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
                {/* Image Container */}
                <div className="overflow-hidden rounded-t-lg relative flex-grow" style={{ aspectRatio: '1 / 1' }}>
                    <Image
                        className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
                        src={item.data.image_url}
                        alt={replaceText(item.value)}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 25vw, 20vw" // Adjusted sizes for grid layout
                        priority={priority}
                        loading={priority ? 'eager' : 'lazy'}
                    />
                </div>
                {/* Bottom Info Bar */}
                <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
                    <span className="truncate pr-2">{replaceText(item.value)}</span>
                    <div className="bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500 py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden">
                        {/* Render Price using MNT */}
                        <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
                            {renderPrice(item.data.lowest_price_cents, mntRate)}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            View
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
});
ProductCard.displayName = 'ProductCard';


// --- Main Page Component ---

export default function ProductsPage() {
    const [products, setProducts] = useState<Item[]>([])
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false) // For product loading
    const [isCurrencyLoading, setIsCurrencyLoading] = useState(false); // Separate state for currency loading? Optional.
    const [hasMore, setHasMore] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [mntRate, setMntRate] = useState<number | null>(null); // State for MNT rate
    const loadingRef = useRef(null)

    const ITEMS_PER_PAGE = 15;

    // --- Fetch Currency Data Function ---
    const fetchCurrencyData = useCallback(async (forceRefetch = false) => {
        // Use cache if valid and not forced
        if (!forceRefetch && isCacheValid(homeCache.timestamp) && homeCache.mntRate !== null) {
            console.log("Using cached MNT rate:", homeCache.mntRate);
            // FIX 3: Remove conditional check; React handles bail-out if value is same
            setMntRate(homeCache.mntRate);
            return homeCache.mntRate;
        }

        // Fetch if not cached, expired, or forced
        console.log(forceRefetch ? "Forcing fetch MNT rate..." : "Fetching MNT rate...");
        setIsCurrencyLoading(true); // Indicate currency loading

        try {
            const res = await fetch('https://hexarate.paikama.co/api/rates/latest/USD?target=MNT');
            if (!res.ok) throw new Error(`Currency API error! status: ${res.status}`);
            const currencyData = await res.json();

            if (currencyData.status_code === 200 && currencyData.data?.mid) {
                const rate = currencyData.data.mid;
                setMntRate(rate); // Update state
                homeCache.mntRate = rate; // Update cache
                homeCache.timestamp = Date.now(); // Update shared timestamp
                console.log("MNT rate fetched and cached:", rate);
                setError(null); // Clear previous currency errors if successful
                return rate;
            } else {
                // Try to get a more specific error message if possible
                const message = currencyData.message || 'MNT rate not available or invalid format';
                throw new Error(message);
            }
        // FIX 2: Use unknown instead of any
        } catch (error: unknown) {
            // Now we safely check the type before accessing properties
            const message = error instanceof Error ? error.message : 'Failed to fetch currency data';
            console.error('Failed to fetch currency data:', error);
            // Append currency error to existing errors, or set if no other errors
            setError((prevError) => {
                const currencyError = `Failed to fetch currency: ${message}`;
                return prevError ? `${prevError}\n${currencyError}` : currencyError;
            });
            const fallbackRate = null; // Set to null on failure so renderPrice shows '...'
            setMntRate(fallbackRate);
            // Optionally cache fallback? Decided against it here.
            return fallbackRate;
        } finally {
            setIsCurrencyLoading(false); // Stop currency loading indicator
        }
    // FIX 3: Empty dependency array is now correct as mntRate state is not read inside.
    }, [/* no dependencies needed here after refactor */]);


    // --- Fetch Products Function ---
    const fetchProducts = useCallback(
        async (pageNum: number) => {
            // Only set product loading state
            setIsLoading(true);
            // Don't reset main error here, let currency errors persist if they occurred
            // setError(null);

            try {
                const res = await fetch(`/api/for-you?page=${pageNum}`);
                if (!res.ok) throw new Error(`Product API error! status: ${res.status} ${res.statusText}`);

                const data: ApiResponse = await res.json();
                if (data.error) throw new Error(data.error);

                const newItems: Item[] = data.products.map((product): Item => ({
                    value: product.name,
                    data: {
                        id: product.id,
                        slug: product.slug,
                        image_url: product.image,
                        lowest_price_cents: Math.round(product.price * 100), // USD cents
                    }
                }));

                setProducts((prev) => pageNum === 1 ? newItems : [...prev, ...newItems]);
                setHasMore(data.hasMore);

                if (isInitialLoad && newItems.length > 0) {
                    setIsInitialLoad(false);
                }

            } catch (err: unknown) { // Good practice to use unknown here too
                const message = err instanceof Error ? err.message : 'An unknown product error occurred';
                console.error("Fetch Products Error:", err);
                 // Append product error to existing errors
                 setError((prevError) => {
                    const productError = `Failed to fetch products: ${message}`;
                    return prevError ? `${prevError}\n${productError}` : productError;
                });
            } finally {
                setIsLoading(false); // Stop product loading state
            }
        },
        [isInitialLoad], // Keep isInitialLoad as fetch logic depends on it
    );

    // --- Intersection Observer ---
    useEffect(() => {
        if (!loadingRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                // Load next page only if not currently loading products and there are more products
                if (entry.isIntersecting && !isLoading && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { rootMargin: '400px' },
        );

        const currentRef = loadingRef.current;
        observer.observe(currentRef);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [isLoading, hasMore]); // Depends on product loading state and availability

    // --- Initial Data Load Effect ---
    useEffect(() => {
        // Fetch both products and currency on initial mount
        fetchProducts(1);
        fetchCurrencyData(); // Fetch currency, will use cache if valid
    }, [fetchProducts, fetchCurrencyData]); // Add fetchCurrencyData dependency

    // --- Fetch More Products Effect ---
    useEffect(() => {
        // Fetch next product page when page number changes (and it's not the initial load)
        if (page > 1) {
            fetchProducts(page);
        }
    }, [page, fetchProducts]); // Depends on page number


    return (
        <div className="text-white p-4 md:p-6 lg:p-8 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>For you</h1>

            {/* Display persistent errors at the top */}
            {error && (
                 <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm whitespace-pre-line">
                    <p>Error encountered:</p>
                    {error}
                    {/* Add specific retry buttons if needed, e.g., retry currency */}
                    {error.includes("currency") && (
                         <button
                            onClick={() => fetchCurrencyData(true)} // Force refetch currency
                            className="mt-2 ml-2 px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-600 transition-colors duration-200 text-white"
                        >
                            Retry Currency
                        </button>
                    )}
                     {error.includes("products") && (
                         <button
                            onClick={() => fetchProducts(page)} // Retry current product page
                            className="mt-2 ml-2 px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-600 transition-colors duration-200 text-white"
                        >
                            Retry Products
                        </button>
                    )}
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1 sm:gap-4 text-xs">
                {/* Initial Loading State Skeletons */}
                {isInitialLoad && isLoading &&
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <SkeletonCard key={`skel-${i}`} />
                    ))
                }

                {/* Render Products */}
                {products.map((item, index) => (
                    <ProductCard
                        key={item.data.id}
                        item={item}
                        priority={index < 10} // Prioritize first ~10 images
                        mntRate={mntRate} // Pass the rate down
                    />
                ))}
            </div>

            {/* Loading/End Indicators */}
            <div ref={loadingRef} className="h-20 flex justify-center items-center mt-8">
                {/* Loading more products indicator */}
                {isLoading && !isInitialLoad && (
                    <div className="flex items-center space-x-2 text-neutral-400">
                        <svg className="animate-spin h-5 w-5 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading more products...</span>
                    </div>
                )}

                {/* End of List Message */}
                {!hasMore && !isLoading && products.length > 0 && (
                    <div className="text-center text-neutral-500">
                        {/* FIX 4: Use &apos; for apostrophe */}
                        <p>You&apos;ve reached the end!</p>
                    </div>
                )}

                 {/* Currency Loading Indicator (optional, maybe overlay or subtle) */}
                 {isCurrencyLoading && (
                    <div className="text-xs text-neutral-500 absolute bottom-2 right-2">
                        <span>Updating rate...</span>
                    </div>
                 )}
            </div>

            {/* Minimal Global Styles */}
            <style jsx global>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}