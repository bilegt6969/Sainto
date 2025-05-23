'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense, useRef, memo } from 'react' // Import memo
import Link from 'next/link'
import Image from 'next/image'

// --- WARNING ---
// Storing API keys directly in client-side code is insecure.
// Move this logic to a backend API route for security.
const CONSTRUCT_API_KEY = 'key_XT7bjdbvjgECO5d8'; // Replace with your actual key, but ideally fetch from backend
const CONSTRUCT_CLIENT_ID = 'c1a92cc3-02a4-4244-8e70-bee6178e8209'; // Example Client ID
const RESULTS_PER_PAGE = 24; // Define results per page

// --- Interfaces ---
interface ProductData {
  id: string
  slug: string
  image_url: string
  lowest_price_cents: number | null | undefined
}

interface Product {
  data: ProductData
  value: string // Product name/title
}

// Interface for the expected structure from the direct API call
interface DirectApiResponse {
    response: {
        results?: Product[];
        total_num_results?: number;
    }
    // Add other potential fields if needed for error handling etc.
}

// Interface for the structure returned by our internal fetchData wrapper
interface FetchDataResponse {
    results: Product[];
    hasMore: boolean;
    totalResults?: number; // Optional total results count
}


// --- Skeleton Components ---

// Skeleton matching the DesktopProductCard structure
const ProductCardSkeleton = () => (
  <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative h-full flex flex-col animate-pulse">
    {/* Image Area */}
    <div className="overflow-hidden rounded-t-lg relative flex-grow bg-neutral-700" style={{ aspectRatio: '1/1' }}></div>
    {/* Bottom Info Bar */}
    <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative">
      {/* Name Placeholder */}
      <div className="h-4 bg-neutral-600 rounded w-3/4"></div>
      {/* Price/Button Placeholder */}
      <div className="h-8 w-[90px] bg-neutral-600 rounded-full"></div>
    </div>
  </div>
);

const SearchResultsSkeleton = ({ count = 10 }: { count?: number }) => (
   <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);


// --- Product Card Components (Desktop & Mobile) ---

// --- Desktop Product Card ---
interface DesktopProductCardProps {
    product: Product;
    mntRate: number | null;
    replaceText: (text: string) => string;
    index: number; // Use index to determine priority
}

const DesktopProductCard = memo(({ product, mntRate, replaceText, index }: DesktopProductCardProps) => {
    const priority = index < 5; // Determine priority based on index

    // Helper function to render formatted price
    const renderPrice = (priceCents: number | null | undefined): string => {
        if (mntRate === null) return '...';
        const price = (typeof priceCents === 'number' && typeof mntRate === 'number')
            ? (priceCents * mntRate) / 100
            : 0;
        return `₮ ${Math.ceil(price).toLocaleString('en-US')}`; // Using Mongolian Tugrik symbol
    };

    const productLink = product.data.slug ? `/product/${product.data.slug}` : '#';
    const productName = product.value || "Untitled Product";
    const productImageUrl = product.data.image_url;
    const priceDisplay = renderPrice(product.data.lowest_price_cents);

    return (
        <Link href={productLink} passHref className={`block h-full ${!product.data.slug ? 'pointer-events-none' : ''}`}>
            <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
                {/* Image Container */}
                <div
                    className="overflow-hidden rounded-t-lg relative flex-grow bg-black"
                    style={{ aspectRatio: '1 / 1' }}
                 >
                  {productImageUrl ? (
                    <Image
                        className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
                        src={productImageUrl}
                        alt={replaceText(productName)}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        priority={priority}
                        loading={priority ? 'eager' : 'lazy'}
                         onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                   ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs rounded-t-lg">No Image</div>
                   )}
                </div>
                {/* Bottom Info Bar */}
                <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
                    <span className="truncate pr-2">{replaceText(productName)}</span>
                    <div className="bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500 py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden">
                        <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">{priceDisplay}</span>
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">View</span>
                    </div>
                </div>
            </div>
        </Link>
    );
});
DesktopProductCard.displayName = 'DesktopProductCard';

// --- Mobile Product Card ---
interface MobileProductCardProps {
    product: Product;
    mntRate: number | null;
    replaceText: (text: string) => string;
    index: number; // Use index to determine priority
}

const MobileProductCard = memo(({ product, mntRate, replaceText, index }: MobileProductCardProps) => {
    const priority = index < 2; // Prioritize fewer items for mobile initial load

    // Helper function to render formatted price
    const renderPrice = (priceCents: number | null | undefined): string => {
        if (mntRate === null) return '...';
        const price = (typeof priceCents === 'number' && typeof mntRate === 'number')
            ? (priceCents * mntRate) / 100
            : 0;
        return `₮ ${Math.ceil(price).toLocaleString('en-US')}`; // Using Mongolian Tugrik symbol
    };

    const productLink = product.data.slug ? `/product/${product.data.slug}` : '#';
    const productName = product.value || "Untitled Product";
    const productImageUrl = product.data.image_url;
    const priceDisplay = renderPrice(product.data.lowest_price_cents);

    return (
         <Link href={productLink} passHref className={`block h-full ${!product.data.slug ? 'pointer-events-none' : ''}`}>
             <div className="text-white bg-black border border-neutral-800 tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neutral-600 h-full flex flex-col group">
                 {/* Top Price Bar */}
                 <div className="block w-full text-xs font-bold flex items-center text-center justify-center p-2 bg-black backdrop-blur-sm border-b border-neutral-700 ">
                    <span className="block">{priceDisplay}</span>
                 </div>
                 {/* Image Container */}
                 <div
                    className="overflow-hidden relative flex-grow bg-black"
                    style={{ aspectRatio: '1 / 1' }}
                 >
                   {productImageUrl ? (
                    <Image
                        className="mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
                        src={productImageUrl}
                        alt={replaceText(productName)}
                        fill
                        sizes="(max-width: 640px) 60vw, 50vw" // Adjust sizes based on actual layout needs
                        priority={priority}
                        loading={priority ? 'eager' : 'lazy'}
                         onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs">No Image</div>
                    )}
                 </div>
                 {/* Bottom Product Name Bar */}
                 <div className="w-full text-xs font-bold flex items-center p-3 border-t border-neutral-700 justify-start text-start relative group-hover:border-neutral-500 transition-colors duration-300 rounded-b-lg">
                    <span className="truncate">{replaceText(productName)}</span>
                 </div>
                 
             </div>
         </Link>
    );
});
MobileProductCard.displayName = 'MobileProductCard';


// --- Main Search Page Component ---

const SearchPage = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')

  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [mntRate, setMntRate] = useState<number | null>(null) // State for MNT currency rate
  const [totalResults, setTotalResults] = useState<number | null>(null);

  const observer = useRef<IntersectionObserver | null>(null)

  // --- Fetch Data Function (Direct Client-Side Call - Use Backend Ideally) ---
  const fetchData = useCallback(async (pageNum: number, currentQuery: string | null): Promise<FetchDataResponse | null> => {
    if (!currentQuery || !CONSTRUCT_API_KEY) {
        setError(!CONSTRUCT_API_KEY ? "Search API key is not configured." : "Invalid search query.");
        return null;
    }

    const encodedQuery = encodeURIComponent(currentQuery);
    const url = `https://ac.cnstrc.com/search/${encodedQuery}?c=ciojs-client-2.54.0&key=${CONSTRUCT_API_KEY}&i=${CONSTRUCT_CLIENT_ID}&s=37&page=${pageNum}&num_results_per_page=${RESULTS_PER_PAGE}&sort_by=relevance&sort_order=descending&_dt=${Date.now()}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
          let errorMsg = `API Error: ${res.status}`;
          try { 
            const errorBody = await res.json(); 
            errorMsg = `API Error: ${res.status} - ${errorBody?.message || 'Unknown error'}`; 
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
            throw new Error(errorMsg);
        }

        const result: DirectApiResponse = await res.json();
        const fetchedProducts = result?.response?.results || [];
        const totalNumResults = result?.response?.total_num_results;

        // Filter for essential data (ID, slug, image_url)
        const validProducts = fetchedProducts.filter(p => p.data?.id && p.data?.slug && p.data?.image_url);

        // Determine if more results *could* exist based on API response before filtering
        let apiHasMore = fetchedProducts.length === RESULTS_PER_PAGE;
        if (totalNumResults !== undefined && pageNum * RESULTS_PER_PAGE >= totalNumResults) {
            apiHasMore = false;
        }

        return {
            results: validProducts, // Return only valid (displayable) products
            hasMore: apiHasMore,    // Base 'hasMore' on pre-filter API response
            totalResults: totalNumResults
        };

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred during fetch';
        console.error("Fetch Data Error:", message);
        setError(message);
        return null;
    }
  }, []); // CONSTRUCT_CLIENT_ID removed if static

  // --- Load More Function ---
  const loadMoreProducts = useCallback(async () => {
    if (!query || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);
    const nextPage = page + 1;
    const response = await fetchData(nextPage, query);

    if (response) {
        if (response.results.length > 0) {
           setProducts(prev => [...prev, ...response.results]);
           setPage(nextPage);
        }
        // Stop pagination if API says no more OR if the current fetch returned 0 valid items
        setHasMore(response.hasMore && response.results.length > 0);
    } else {
        // Error is set by fetchData, don't necessarily stop pagination on temporary error
        // setError("Failed to load more products. Please try again later."); // Example user-friendly message
    }
    setIsLoadingMore(false);
  }, [query, page, hasMore, fetchData, isLoadingMore]);

  // --- Intersection Observer Setup ---
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return; // Don't observe if already loading/fetching
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // Check if intersecting, more results might exist, and not currently loading more
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMoreProducts();
      }
    }, { threshold: 0.5 }); // Trigger when 50% visible

    if (node) observer.current.observe(node); // Observe the sentinel div

  }, [isLoading, isLoadingMore, hasMore, loadMoreProducts]); // Dependencies for the observer setup

  // --- Fetch MNT Currency Rate ---
  // --- Fetch MNT Currency Rate ---
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const res = await fetch('/api/getcurrencydata');
        if (!res.ok) throw new Error('Failed to fetch currency rate');
        const currencyResult = await res.json();
        if (currencyResult.mnt && typeof currencyResult.mnt === 'number') {
          setMntRate(currencyResult.mnt);
        } else {
           console.warn('MNT rate not available or invalid from API');
        }
      } catch (err) {
        console.error('Currency fetch error:', err);
        setError(prevError => prevError ? `${prevError}\nFailed to load currency rate.` : 'Failed to load currency rate.');
      }
    };
    fetchCurrencyData();
  }, []);

  // --- Initial Data Load Effect (on query change) ---
  useEffect(() => {
    const loadInitialData = async () => {
      if (!query) {
        setProducts([]);
        setIsLoading(false);
        setHasMore(false);
        setTotalResults(0);
        setError(null);
        return;
      }

      setIsLoading(true);
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      setTotalResults(null);

      const response = await fetchData(1, query);

      if (response) {
        setProducts(response.results);
        setHasMore(response.hasMore && response.results.length > 0);
        if (response.totalResults !== undefined) {
            setTotalResults(response.totalResults);
        }
      } else {
          setHasMore(false);
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, [query, fetchData]);

 // --- Initial Data Load Effect (on query change) ---
 useEffect(() => {
    const loadInitialData = async () => {
      // If there's no query, clear results and stop loading
      if (!query) {
        setProducts([]);
        setIsLoading(false); // Not loading anymore
        setHasMore(false);   // No results to load more from
        setTotalResults(0);
        setError(null);      // Clear any previous errors
        return;
      }

      // Start loading state for a new query
      setIsLoading(true);
      setProducts([]);    // Clear previous results
      setPage(1);         // Reset page number
      setHasMore(true);   // Assume there are results initially
      setError(null);     // Clear previous errors
      setTotalResults(null); // Reset total

      const response = await fetchData(1, query);

      if (response) {
        setProducts(response.results);
        // Only hasMore if API says so AND we actually got valid items to display
        setHasMore(response.hasMore && response.results.length > 0);
        if (response.totalResults !== undefined) {
            setTotalResults(response.totalResults);
        }
      } else {
          // Error should be set by fetchData
          setHasMore(false); // Stop loading more if initial fetch failed
      }
      setIsLoading(false); // Finish loading state
    };

    loadInitialData();
   }, [query, fetchData]); // Re-run when query or fetchData function changes


  // --- Render Logic ---

  // Simple text replacement function (customize if needed)
  const replaceText = (text: string): string => {
    // Example: return text.replace(/some_pattern/g, 'replacement');
    return text; // No replacements applied currently
  };

  const displayQuery = query ? `"${query}"` : '';

  // Determine results count text
  let resultsCountText = '';
  if (!isLoading && totalResults !== null) {
      resultsCountText = `${totalResults} result${totalResults !== 1 ? 's' : ''} found`;
      // Add clarification if displayed count differs due to filtering
      if (products.length < totalResults && products.length > 0) {
          resultsCountText += ` (${products.length} shown)`;
      }
  } else if (!isLoading && products.length > 0) {
       resultsCountText = `${products.length}${hasMore ? '+' : ''} items displayed`;
  }

  return (
    <div className="text-white container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">
        Search Results {displayQuery ? `for ${displayQuery}` : ''}
      </h1>

      {/* 1. Initial Loading State */}
      {isLoading && (
        <SearchResultsSkeleton count={RESULTS_PER_PAGE}/>
      )}

      {/* 2. Error on Initial Load (No results shown yet) */}
      {!isLoading && error && products.length === 0 && (
        <p className="text-red-500 text-center py-10">Error loading results: {error}</p>
      )}

      {/* 3. No Results Found (After successful load) */}
      {!isLoading && !error && products.length === 0 && query && (
        <p className="text-neutral-400 text-center py-10">No products found matching your search.</p>
       )}

      {/* 4. No Query Provided */}
       {!isLoading && !error && products.length === 0 && !query && (
        <p className="text-neutral-400 text-center py-10">Please enter a search term to begin.</p>
      )}

      {/* 5. Display Results Grid */}
      {!isLoading && products.length > 0 && (
        <>
          {resultsCountText && <p className="text-neutral-400 text-sm mb-4">{resultsCountText}</p>}
          {/* --- RESPONSIVE GRID --- */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-4"> {/* Adjusted grid-cols-2 for smallest size */}
            {products.map((item, idx) => (
              // Wrapper div with the key for each logical list item
              <div key={item.data.id || `product-${idx}`}>

                {/* Mobile Card: Shown by default, hidden >= md */}
                <div className="block md:hidden h-full">
                  <MobileProductCard
                     product={item}
                     mntRate={mntRate}
                     replaceText={replaceText}
                     index={idx}
                   />
                </div>

                {/* Desktop Card: Hidden by default, shown >= md */}
                <div className="hidden md:block h-full">
                  <DesktopProductCard
                     product={item}
                     mntRate={mntRate}
                     replaceText={replaceText}
                     index={idx}
                   />
                </div>

              </div>
            ))}
          </div>
          {/* Sentinel Div for Triggering Infinite Scroll */}
          {hasMore && <div ref={sentinelRef} style={{ height: '50px', width: '100%' }} aria-hidden="true"></div>}
        </>
      )}

       {/* 6. Loading More Indicator */}
       {isLoadingMore && (
        <div className="text-center my-6 flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <p className="text-neutral-300">Loading more products...</p>
        </div>
      )}

      {/* 7. Error While Loading More (Some results already shown) */}
      {!isLoadingMore && error && products.length > 0 && !error.includes('currency rate') /* Avoid showing fetch error if it's just currency */ && (
           <div className="text-center my-6">
               <p className="text-red-500">Error loading more results: {error}</p>
          </div>
      )}

      {/* 8. End of Results Message */}
      {!isLoading && !isLoadingMore && !hasMore && products.length > 0 && (
           <div className="text-center my-6">
<p className="text-neutral-500">You&apos;ve reached the end of the results.</p>
           </div>
      )}
    </div>
  );
}

// Wrap the SearchPage component in a Suspense boundary for Next.js App Router
const SearchPageWithSuspense = () => (
  <div className="">
  <Suspense fallback={
    // Provide a fallback UI that matches the initial loading state
    <div className="text-white container mx-auto px-4 py-6">
       <h1 className="text-2xl font-bold mb-4">Search Results</h1>
       <SearchResultsSkeleton count={RESULTS_PER_PAGE} />
    </div>
   }>
    <SearchPage />
  </Suspense>
  </div>
)

export default SearchPageWithSuspense;