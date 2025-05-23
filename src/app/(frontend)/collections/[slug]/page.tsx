'use client';

// Import 'use' hook from React for resolving promises in Client Components
import React, { useState, useEffect, useCallback, useRef, memo, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Import the response types defined in the API route
import type { ApiResponse, ApiProduct } from '../../../api/collections/[slug]/route';
// Adjust path if needed

// --- Interface Definitions ---

// Interface for product data stored in the page's state
interface ItemData {
  id: string;
  slug: string; // Product-specific slug for linking
  image_url: string;
  lowest_price_dollars: number; // Prices stored in USD DOLLARS
}

// Interface for the item structure used in the page's state
interface Item {
  data: ItemData;
  value: string; // Product name
}

// --- Define PageProps Interface for Next.js 15+ ---
// Params is now a Promise containing the actual parameters object
interface PageProps {
  params: Promise<{ slug: string }>;
  // searchParams would also be a Promise if used
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// --- In-Memory Cache for Currency Rate ---
interface HomeCache {
  mntRate: number | null;
  timestamp: number | null;
}

const homeCache: HomeCache = { mntRate: null, timestamp: null };
const CACHE_DURATION_MS = 60 * 60 * 1000; // 60 minutes

const isCacheValid = (cacheTimestamp: number | null): boolean => {
  if (!cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION_MS;
};

// --- Helper Utility Functions ---

// Modified price formatter: Accepts USD DOLLARS and MNT rate
const renderPrice = (priceDollarsUSD: number, mntRate: number | null): string => {
  // Handle unavailable or invalid inputs explicitly
  if (mntRate === null || typeof mntRate !== 'number' || isNaN(mntRate)) {
    return '...'; // Indicate rate is loading or unavailable
  }

  if (typeof priceDollarsUSD !== 'number' || isNaN(priceDollarsUSD) || priceDollarsUSD <= 0) {
    return 'N/A'; // Price not available, invalid, or zero/negative
  }

  const priceMNT = priceDollarsUSD * mntRate;
  // Format as MNT currency
  return priceMNT.toLocaleString('en-US', {
    // Using en-US locale can be robust for MNT
    style: 'currency',
    currency: 'MNT', // Mongolian Tugrik
    maximumFractionDigits: 0, // No fractional tugriks typically shown
  });
};

// Basic text replacer (expand as needed)
const replaceText = (text: string): string => {
  // Example: Remove trademark symbols
  return text.replace(/™|®/g, '');
};

// --- Skeleton Loading Component ---
const SkeletonCard = () => (
  <div className="text-white bg-neutral-800 border border-neutral-700 rounded-lg tracking-tight relative h-full flex flex-col animate-pulse">
    <div className="overflow-hidden rounded-t-lg relative flex-grow bg-neutral-700" style={{ aspectRatio: '1/1' }}></div>
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
  mntRate: number | null;
  isCurrencyLoading: boolean; // Pass loading state down
}

const ProductCard = memo(({ item, priority, mntRate, isCurrencyLoading }: ProductCardProps) => {
  // Use the product-specific slug from item.data.slug for the link
  const productLink = `/product/${item.data.slug}`;
  const isLoadingPrice = mntRate === null && isCurrencyLoading;
  return (
    <Link href={productLink} passHref legacyBehavior>
      <a className="text-white bg-black border border-neutral-700 rounded-lg tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
        {/* Image Container */}
        <div className="overflow-hidden rounded-t-lg relative flex-grow" style={{ aspectRatio: '1/1' }}>
          <Image
            className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
            src={item.data.image_url}
            alt={replaceText(item.value)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
        {/* Bottom Info Bar */}
        <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
          <span className="truncate pr-2">{replaceText(item.value)}</span>
          <div
            className={`bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500 py-1 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden ${
              isLoadingPrice ? 'animate-pulse' : ''
            }`}
          >
            {/* Show '...' placeholder subtly if currency is loading */}
            {isLoadingPrice ? (
              <span className="block text-neutral-500">...</span>
            ) : (
              <>
                {/* Render Price using MNT: Pass DOLLARS price */}
                <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
                  {renderPrice(item.data.lowest_price_dollars, mntRate)}
                </span>
                {/* "View" on hover */}
                <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  View
                </span>
              </>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
});
ProductCard.displayName = 'ProductCard';

// --- Main Page Component ---

// Accept props according to the PageProps interface (params is a Promise)
export default function CollectionPage(props: PageProps) {
  // Use the 'use' hook to resolve the params Promise in a Client Component
  const resolvedParams = use(props.params);
  const { slug: collectionSlug } = resolvedParams; // Destructure slug from the *resolved* params

  // State and Refs remain the same
  const [products, setProducts] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrencyLoading, setIsCurrencyLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mntRate, setMntRate] = useState<number | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE_DISPLAY = 15;

  // --- Fetch Currency Data Function (no changes needed here) ---
  const fetchCurrencyData = useCallback(async (forceRefetch = false) => {
    // Check cache first (unless forcing refetch)
    if (!forceRefetch && isCacheValid(homeCache.timestamp) && homeCache.mntRate !== null) {
      if (mntRate !== homeCache.mntRate) {
        // Only update state if value changed
        setMntRate(homeCache.mntRate);
      }
      console.log('Using cached MNTrate:', homeCache.mntRate);
      return homeCache.mntRate;
    }

    console.log(forceRefetch ? 'Forcing fetch MNTrate...' : 'Fetching MNTrate...');
    setIsCurrencyLoading(true); // Set loading true specific to currency
    try {
      // Using a public API proxy - replace if you have a direct source
      const res = await fetch('https://hexarate.paikama.co/api/rates/latest/USD?target=MNT');
      if (!res.ok) throw new Error(`CurrencyAPI error! status: ${res.status}`);
      const currencyData = await res.json();
      if (currencyData.status_code === 200 && currencyData.data?.mid) {
        const rate = currencyData.data.mid;
        setMntRate(rate);
        homeCache.mntRate = rate;
        homeCache.timestamp = Date.now();
        console.log('MNTrate fetched and cached:', rate);
        // Clear ONLY currency-related errors on success
        setError((prev) => prev?.replace(/Failed to fetch currency: [^\n]*/g, '').trim() || null);
        return rate;
      } else {
        throw new Error(currencyData.message || 'MNTrate not available or invalid format');
      }
    } catch (err: unknown) {
      console.error('Failed to fetch currency data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown currency fetch error';
      const currencyError = `Failed to fetch currency: ${errorMessage}`;
      setError((prevError) => (prevError ? `${prevError}\n${currencyError}` : currencyError));
      setMntRate(null); // Ensure rate is null on failure
      return null;
    } finally {
      setIsCurrencyLoading(false); // Always set loading false after attempt
    }
}, [mntRate]); // Dependency ensures cache comparison uses current state value


  // --- Fetch Products Function (no changes needed here, uses collectionSlug) ---
  const fetchProducts = useCallback(
    async (pageNum: number) => {
      // collectionSlug is now available directly here because it's resolved
      // synchronously within the component body thanks to the 'use' hook.
      if (!collectionSlug) {
        console.error('fetchProducts called without collectionSlug.');
        setError((prev) => (prev ? `${prev}\nCollection identifier is missing.` : 'Collection identifier is missing.'));
        setIsLoading(false); // Stop loading if no slug
        return;
      }

      console.log(`Fetching products page ${pageNum} for collection "${collectionSlug}"...`);
      setIsLoading(true); // Set loading true specific to products
      const apiUrl = `/api/collections/${collectionSlug}?page=${pageNum}`;
      try {
        const res = await fetch(apiUrl);
        const data: ApiResponse = await res.json(); // Expecting our internal API structure

        // Handle errors reported by our *internal* API
        if (!res.ok || data.error) {
          const message = data.error || `ProductAPI error! Status: ${res.status} ${res.statusText}`;
          throw new Error(message);
        }

        // Map ApiProduct (from internal API) to Item (for page state)
        const newItems: Item[] = data.products.map((product: ApiProduct): Item => ({
          value: product.name, // Product name
          data: {
            id: product.id,
            slug: product.slug, // Use product-specific slug from API
            image_url: product.image,
            lowest_price_dollars: product.price, // Assign price in DOLLARS directly
          },
        }));

        // Check for duplicate IDs before adding new items
        setProducts((prev) => {
            const existingIds = new Set(prev.map(p => p.data.id));
            const uniqueNewItems = newItems.filter(item => !existingIds.has(item.data.id));
            if (uniqueNewItems.length < newItems.length) {
                console.warn(`Filtered out ${newItems.length - uniqueNewItems.length} duplicate product(s) from page ${pageNum}`);
            }
            return pageNum === 1 ? uniqueNewItems : [...prev, ...uniqueNewItems];
        });

        setHasMore(data.hasMore);
        if (pageNum === 1) {
          // Only adjust initial load flag on the first page fetch
          setIsInitialLoad(false);
        }
        // Clear ONLY product-related errors on success
        setError((prev) => prev?.replace(/Failed to fetch products: [^\n]*/g, '').trim() || null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown product error occurred';
        console.error('FetchProductsError:', err);
        const productError = `Failed to fetch products: ${message}`; // Append/set error using functional update
        setError((prevError) => (prevError ? `${prevError}\n${productError}` : productError));
        setHasMore(false); // Stop infinite scroll on error
        if (pageNum === 1) {
          // Ensure initial load flag is unset even on errors
          setIsInitialLoad(false);
        }
      } finally {
        setIsLoading(false); // Always set loading false after attempt
      }
    },
    [collectionSlug] // Dependency: Refetch if resolved slug changes
  );

  // --- Intersection Observer for Infinite Scroll (no changes needed) ---
  useEffect(() => {
    // Don't observe until the initial load is done (skeletons are gone)
    if (!loadingRef.current || isInitialLoad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Load next page ONLY if intersecting, not already loading products, and more exist
        if (entry.isIntersecting && !isLoading && hasMore) {
          console.log('Intersection observer triggered: Loading next page');
          setPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: '400px' } // Trigger when 400px below viewport
    );
    const currentRef = loadingRef.current;
    observer.observe(currentRef);
    // Cleanup function
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
    // Re-run observer setup if loading state, hasMore, or initialLoad completion changes
  }, [isLoading, hasMore, isInitialLoad]);

  // --- Initial Data Load Effect (on slug change - no changes needed) ---
  useEffect(() => {
    // collectionSlug is resolved synchronously above, so this check works
    if (collectionSlug) {
      console.log('Initial load effect for collection:', collectionSlug);
      // Reset state for the new collection
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setIsInitialLoad(true); // Set loading state for skeletons
      setError(null); // Clear errors from previous collection
      setMntRate(homeCache.mntRate); // Optimistically set cached rate if available
      // Fetch initial data
      fetchProducts(1); // Fetch page 1 products
      fetchCurrencyData(); // Fetch currency (uses cache if valid)
    } else {
      // This case might be less likely now since 'use' suspends until resolved,
      // but good to keep for robustness if props could somehow be invalid.
      console.error('Collection slug is missing after resolving params!');
      setError('Could not determine which collection to load.');
      setIsInitialLoad(false); // Ensure loading state stops if slug is missing
    }
    // This effect runs when the resolved collectionSlug changes
  }, [collectionSlug, fetchProducts, fetchCurrencyData]); // Include stable fetch functions

  // --- Fetch More Products Effect (on page change - no changes needed) ---
  useEffect(() => {
    // Fetch next page only if page > 1 and not during initial load phase
    if (page > 1 && !isInitialLoad && collectionSlug) {
      fetchProducts(page);
    }
    // This effect runs when page changes, AFTER initial load is complete
  }, [page, isInitialLoad, collectionSlug, fetchProducts]);

  // --- Render Logic (no changes needed) ---
  return (
    <div className="text-white p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-black to-neutral-900">
      {/* Collection Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in-up capitalize">
        {collectionSlug ? collectionSlug.replace(/-/g, ' ') : 'Products'}
      </h1>
      {/* Persistent Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/60 border border-red-700 rounded text-red-200 text-sm whitespace-pre-lines shadow-lg">
          <p className="font-semibold mb-1">Error encountered:</p>
          {error}
          <div className="mt-2 space-x-2">
            {/* Specific Retry Buttons */}
            {error.includes('currency') && (
              <button
                onClick={() => fetchCurrencyData(true)} // Force refetch currency
                className="px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-600 transition-colors duration-200 text-white font-medium"
              >
                Retry Currency Rate
              </button>
            )}
            {error.includes('products') && collectionSlug && (
              <button
                onClick={() => (page === 1 ? fetchProducts(1) : fetchProducts(page))} // Retry current/first product page
                className="px-3 py-1 text-xs bg-red-700 rounded hover:bg-red-600 transition-colors duration-200 text-white font-medium"
              >
                Retry Loading Products
              </button>
            )}
          </div>
        </div>
      )}
      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 text-xs">
        {/* Initial Loading State Skeletons */}
        {isInitialLoad &&
          Array.from({ length: ITEMS_PER_PAGE_DISPLAY }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
        {/* Render Products (only after initial load) */}
        {!isInitialLoad &&
          products.map((item, index) => (
            <ProductCard // Use product ID as key
              key={item.data.id}
              item={item}
              priority={index < 10} // Prioritize loading images for first ~10 items
              mntRate={mntRate} // Pass down the current rate (or null)
              isCurrencyLoading={isCurrencyLoading} // Pass down currency loading state
            />
          ))}
      </div>
      {/* Loading/End Indicators */}
      <div ref={loadingRef} className="h-24 flex justify-center items-center mt-8 relative">
        {/* Loading more products indicator (only show when loading *more*, not initial) */}
        {isLoading && !isInitialLoad && (
          <div className="flex items-center space-x-2 text-neutral-400">
            <svg className="animate-spin h-5 w-5 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading more...</span>
          </div>
        )}
        {/* End of List Message */}
        {!hasMore && !isLoading && !isInitialLoad && products.length > 0 && (
          <div className="text-center text-neutral-500">
            <p>You&#39;ve reached the end!</p>
          </div>
        )}
        {/* No Products Found Message */}
        {!isLoading && !isInitialLoad && products.length === 0 && !error && (
          <div className="text-center text-neutral-500">
            <p>No products found for this collection.</p>
          </div>
        )}
        {/* Subtle Currency Loading Indicator (optional, could be removed if ProductCard handles it) */}
        {isCurrencyLoading && !mntRate && (
          <div className="text-xs text-neutral-500 absolute bottom-2 right-2 animate-pulse">
            <span>Updating rate...</span>
          </div>
        )}
      </div>
      {/* Minimal Global Styles for Fade-in Animation */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
