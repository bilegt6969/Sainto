'use client'

import React, { useState, useEffect, useCallback, useRef, memo, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import FiltersPanel from '../../../components/filters/FiltersPanel'

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

const renderPriceHelper = (
  priceCents: number | null | undefined,
  mntRate: number | null,
): string => {
  if (priceCents === null || priceCents === undefined) return 'N/A';
  if (mntRate === null) return '...';
  if (priceCents === 0) return 'Unavailable';
  const price = (priceCents * mntRate) / 100;
  return `₮${Math.ceil(price).toLocaleString('en-US')}`;
};

const replaceText = (text: string): string => {
  try {
    return String(text || '')
      .replace(/GOAT/gi, 'SAINT')
      .replace(/Canada/gi, 'MONGOLIA');
  } catch (e) {
    console.error('Error replacing text:', text, e);
    return text || '';
  }
};

// --- Skeleton Loading Component ---
const ProductCardSkeleton = () => (
  <div className="text-white bg-neutral-800 border border-neutral-700 rounded tracking-tight relative h-full flex flex-col animate-pulse">
    <div className="overflow-hidden rounded rounded-b-none relative flex-grow bg-neutral-700" style={{ aspectRatio: '1 / 1' }}></div>
    <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative">
      <div className="h-4 bg-neutral-600 rounded w-3/4 mr-4"></div>
      <div className="h-8 w-[90px] bg-neutral-600 rounded-full"></div>
    </div>
  </div>
);

// --- Memoized Product Card Components ---
interface ProductCardProps {
  product: Item;
  mntRate: number | null;
  index: number;
}

const DesktopProductCard = memo(
  ({ product, mntRate, index }: ProductCardProps) => {
    const priority = index < 5;
    const productLink = product.data.slug ? `/product/${product.data.slug}` : '#';
    const productName = product.value || 'Untitled Product';
    const productImageUrl = product.data.image_url;
    const priceDisplay = renderPriceHelper(product.data.lowest_price_cents, mntRate);
    const isUnavailable = product.data.lowest_price_cents === 0;

    return (
      <Link
        href={productLink}
        passHref
        className={`block h-full ${!product.data.slug ? 'pointer-events-none' : ''}`}
      >
        <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
          <div
            className="overflow-hidden relative flex-grow"
            style={{ aspectRatio: '1 / 1' }}
          >
            {productImageUrl ? (
              <Image
                className="mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
                src={productImageUrl}
                alt={replaceText(productName)}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, (max-width: 1536px) 25vw, 20vw"
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs';
                    placeholder.innerText = 'Image Error';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs">
                No Image
              </div>
            )}
          </div>
          <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
            <span className="truncate pr-2">{replaceText(productName)}</span>
            <div
              className={`py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden ${
                isUnavailable
                  ? 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                  : 'bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500'
              }`}
            >
              {isUnavailable ? (
                <span className="block">Unavailable</span>
              ) : (
                <>
                  <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
                    {priceDisplay}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    View
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  },
);
DesktopProductCard.displayName = 'DesktopProductCard';

const MobileProductCard = memo(
  ({ product, mntRate, index }: ProductCardProps) => {
    const priority = index < 4;
    const productLink = product.data.slug ? `/product/${product.data.slug}` : '#';
    const productName = product.value || 'Untitled Product';
    const productImageUrl = product.data.image_url;
    const priceDisplay = renderPriceHelper(product.data.lowest_price_cents, mntRate);
    const isUnavailable = product.data.lowest_price_cents === 0;

    return (
      <Link
        href={productLink}
        passHref
        className={`block h-full ${!product.data.slug ? 'pointer-events-none' : ''}`}
      >
        <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neutral-600 h-full flex flex-col group">
          <div className="block w-full text-xs font-bold flex items-center p-2 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-700">
            <span className="block w-full text-center">
              {isUnavailable ? 'Unavailable' : priceDisplay}
            </span>
          </div>
          <div
            className="overflow-hidden rounded-b-lg relative flex-grow"
            style={{ aspectRatio: '1 / 1' }}
          >
            {productImageUrl ? (
              <Image
                className="rounded-b-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
                src={productImageUrl}
                alt={replaceText(productName)}
                fill
                sizes="50vw"
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs rounded-b-lg';
                    placeholder.innerText = 'Image Error';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs rounded-b-lg">
                No Image
              </div>
            )}
          </div>
          <div className="w-full text-xs font-bold flex items-center p-3 border-t border-neutral-700 justify-center text-center relative group-hover:border-neutral-500 transition-colors duration-300">
            <span className="truncate">{replaceText(productName)}</span>
          </div>
        </div>
      </Link>
    );
  },
);
MobileProductCard.displayName = 'MobileProductCard';

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
            setMntRate(homeCache.mntRate);
            return homeCache.mntRate;
        }

        // Fetch if not cached, expired, or forced
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
                setError(null); // Clear previous currency errors if successful
                return rate;
            } else {
                const message = currencyData.message || 'MNT rate not available or invalid format';
                throw new Error(message);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch currency data';
            console.error('Failed to fetch currency data:', error);
            setError((prevError) => {
                const currencyError = `Failed to fetch currency: ${message}`;
                return prevError ? `${prevError}\n${currencyError}` : currencyError;
            });
            const fallbackRate = null;
            setMntRate(fallbackRate);
            return fallbackRate;
        } finally {
            setIsCurrencyLoading(false);
        }
    }, []);

    // --- Fetch Products Function ---
    const fetchProducts = useCallback(
        async (pageNum: number) => {
            setIsLoading(true);

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

            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'An unknown product error occurred';
                console.error("Fetch Products Error:", err);
                setError((prevError) => {
                    const productError = `Failed to fetch products: ${message}`;
                    return prevError ? `${prevError}\n${productError}` : productError;
                });
            } finally {
                setIsLoading(false);
            }
        },
        [isInitialLoad],
    );

    // --- Intersection Observer ---
    useEffect(() => {
        if (!loadingRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
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
    }, [isLoading, hasMore]);

    // --- Initial Data Load Effect ---
    useEffect(() => {
        fetchProducts(1);
        fetchCurrencyData();
    }, [fetchProducts, fetchCurrencyData]);

    // --- Fetch More Products Effect ---
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page);
        }
    }, [page, fetchProducts]);

    return (
        <div className="page-container text-white p-4 md:p-6 lg:p-8 min-h-screen">
<Suspense fallback={<div className="h-12 w-full bg-neutral-900 rounded-lg animate-pulse mb-6"></div>}>
                <FiltersPanel />
            </Suspense>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>For you</h1>

            {/* Display persistent errors at the top */}
            {error && (
                 <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm whitespace-pre-line">
                    <p>Error encountered:</p>
                    {error}
                    {error.includes("currency") && (
                         <button
                            onClick={() => fetchCurrencyData(true)}
                            className="mt-2 ml-2 px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-600 transition-colors duration-200 text-white"
                        >
                            Retry Currency
                        </button>
                    )}
                     {error.includes("products") && (
                         <button
                            onClick={() => fetchProducts(page)}
                            className="mt-2 ml-2 px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-600 transition-colors duration-200 text-white"
                        >
                            Retry Products
                        </button>
                    )}
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1 sm:gap-2 text-xs">
                {/* Initial Loading State Skeletons */}
                {isInitialLoad && isLoading &&
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <ProductCardSkeleton key={`skel-${i}`} />
                    ))
                }

                {/* Render Products */}
                {products.map((item, index) => (
    <React.Fragment key={`${item.data.id}-${index}`}>
        <div className="block md:hidden h-full">
            <MobileProductCard
                product={item}
                mntRate={mntRate}
                index={index}
            />
        </div>
        <div className="hidden md:block h-full">
            <DesktopProductCard
                product={item}
                mntRate={mntRate}
                index={index}
            />
        </div>
    </React.Fragment>
))}
            </div>

            {/* Loading/End Indicators */}
            <div ref={loadingRef} className="h-20 flex justify-center items-center mt-8">
                {isLoading && !isInitialLoad && (
                    <div className="flex items-center space-x-2 text-neutral-400">
                        <svg className="animate-spin h-5 w-5 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading more products...</span>
                    </div>
                )}

                {!hasMore && !isLoading && products.length > 0 && (
                    <div className="text-center text-neutral-500">
                        <p>You&apos;ve reached the end!</p>
                    </div>
                )}

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