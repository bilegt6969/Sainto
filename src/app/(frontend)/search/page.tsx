'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// --- NEW IMPORT ---
import { FilterPanel, EbayFilters } from '../../../components/search/FilterPanel'; // Adjust path if needed

const RESULTS_PER_PAGE = 12;

// --- Interfaces (Your existing interfaces) ---
interface ProductVariant {
  // ... (your interface) ...
  id?: string;
  size?: string;
  color?: string;
  stock?: number;
  sku?: string;
  priceCents?: number;
  [key: string]: unknown;
}

interface Product {
  // ... (your interface) ...
  id: string;
  slug: string;
  pictureUrl: string;
  title: string;
  localizedRetailPriceCents: {
    amountCents: number;
    currency: string;
  };
  status?: string;
  inStock?: boolean;
  category?: string;
  brandName?: string;
  variantsList?: ProductVariant[];
  activitiesList?: string[];
  releaseDate?: {
    seconds: number;
    nanos: number;
  };
  silhouette?: string;
  seasonYear?: string;
  productType?: string;
  underRetail?: boolean;
  gender?: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    products: Product[];
    hasMore: boolean;
    totalCount: number;
    filters?: EbayFilters | null; // --- MODIFIED: Added filters ---
  };
  error?: string;
}

interface FetchDataResponse {
  results: Product[];
  hasMore: boolean;
  totalResults: number;
  filters?: EbayFilters | null; // --- MODIFIED: Added filters ---
}

// --- Skeleton Components (FIXED) ---
const ProductCardSkeleton = () => (
  // --- COLOR CHANGE: bg-white -> bg-neutral-100, border-neutral-700 -> border-neutral-300, bg-neutral-800/700 -> bg-neutral-300/400 ---
  <div className="text-black bg-white border border-neutral-300 rounded tracking-tight relative h-full flex flex-col animate-pulse group">
    {/* Mobile-like top bar placeholder for price */}
    <div className="block md:hidden p-2 bg-neutral-300 border-b border-neutral-300">
      <div className="h-4 w-1/2 mx-auto bg-neutral-400 rounded"></div>
    </div>

    {/* Image Area */}
    <div
      className="overflow-hidden relative flex-grow bg-neutral-300 md:rounded-none rounded-b-lg"
      style={{ aspectRatio: '1 / 1' }}
    ></div>

    {/* Bottom Info Bar */}
    {/* Desktop Bottom Bar */}
    <div className="hidden md:flex w-full text-xs font-bold items-center p-4 border-t border-neutral-300 justify-between relative">
      <div className="h-4 bg-neutral-300 rounded w-2/3 mr-4"></div>
      <div className="h-8 w-[90px] bg-neutral-300 rounded-full"></div>
    </div>

    {/* Mobile Bottom Bar */}
    <div className="block md:hidden w-full text-xs font-bold p-3 border-t border-neutral-300 text-center">
      <div className="h-4 bg-neutral-300 rounded w-3/4 mx-auto"></div>
    </div>
  </div>
);

const SearchResultsSkeleton = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-2">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// --- Product Card Components (Your existing components) ---
interface ProductCardProps {
  // ... (your interface) ...
  product: Product;
  mntRate: number | null;
  replaceText: (text: string) => string;
  index: number;
}

const renderPriceHelper = (
  // ... (your helper function) ...
  localizedRetailPriceCents: { amountCents: number; currency: string } | null | undefined,
  mntRate: number | null,
): string => {
  if (!localizedRetailPriceCents?.amountCents) return 'N/A';
  // --- MODIFICATION: Handle Ebay's 'USD' currency directly ---
  if (localizedRetailPriceCents.currency === 'USD' && mntRate === null) return '...';
  if (localizedRetailPriceCents.currency === 'USD' && mntRate !== null) {
     const price = (localizedRetailPriceCents.amountCents * mntRate) / 100;
     return `₮${Math.ceil(price).toLocaleString('en-US')}`;
  }
  // Fallback for non-USD or original logic
  if (mntRate === null) return '...';
  if (localizedRetailPriceCents.amountCents === 0) return 'Unavailable';
  
  const price = (localizedRetailPriceCents.amountCents * mntRate) / 100;
  return `₮${Math.ceil(price).toLocaleString('en-US')}`;
};

// --- Desktop Product Card (Your existing component) ---
const DesktopProductCard = memo(
  // ... (your component code) ...
  ({ product, mntRate, replaceText, index }: ProductCardProps) => {
    const priority = index < 5;

    const productLink = product.slug ? `/product/${product.slug}` : '#';
    const productName = product.title || 'Untitled Product';
    const productImageUrl = product.pictureUrl;
    const priceDisplay = renderPriceHelper(product.localizedRetailPriceCents, mntRate);
    const isUnavailable = product.localizedRetailPriceCents?.amountCents === 0;

    return (
      <Link
        href={productLink}
        passHref
        className={`block h-full ${!product.slug ? 'pointer-events-none' : ''}`}
      >
        {/* COLOR CHANGE: bg-white -> bg-neutral-100, border-neutral-700 -> border-neutral-300, hover:shadow-2xl hover:shadow-blue-900/10 -> hover:shadow-2xl hover:shadow-neutral-300/50, hover:border-neutral-600 -> hover:border-neutral-500 */}
        <div className="text-black bg-neutral-100 borders border-neutral-300 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-neutral-300/50 hover:border-neutral-500 hover:scale-[1.02] h-full flex flex-col group">
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
                unoptimized
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, (max-width: 1536px) 25vw, 20vw"
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    // COLOR CHANGE: bg-neutral-800 text-neutral-500 -> bg-neutral-200 text-neutral-600
                    placeholder.className = 'w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-xs';
                    placeholder.innerText = 'Image Error';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              // COLOR CHANGE: bg-neutral-800 text-neutral-500 -> bg-neutral-200 text-neutral-600
              <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-xs">
                No Image
              </div>
            )}
          </div>
          {/* COLOR CHANGE: border-neutral-700 -> border-neutral-300, group-hover:border-neutral-500 -> group-hover:border-neutral-400 */}
          <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-300 justify-between relative transition-colors duration-300 group-hover:border-neutral-400">
            <span className="truncate pr-2">{replaceText(productName)}</span>
            <div
              className={`py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden ${
                isUnavailable
                  // COLOR CHANGE: bg-neutral-800 border-neutral-700 text-neutral-400 -> bg-neutral-300 border-neutral-400 text-neutral-600
                  ? 'bg-neutral-300 border border-neutral-400 text-neutral-600'
                  // COLOR CHANGE: bg-neutral-800 border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500 -> bg-neutral-300 border-neutral-400 group-hover:bg-neutral-400 group-hover:border-neutral-400
                  : 'bg-neutral-300 backdrop-brightness-90 border border-neutral-400 group-hover:bg-neutral-400 group-hover:border-neutral-400'
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

// --- Mobile Product Card (Your existing component) ---
const MobileProductCard = memo(
  // ... (your component code) ...
  ({ product, mntRate, replaceText, index }: ProductCardProps) => {
    const priority = index < 4;

    const productLink = product.slug ? `/product/${product.slug}` : '#';
    const productName = product.title || 'Untitled Product';
    const productImageUrl = product.pictureUrl;
    const priceDisplay = renderPriceHelper(product.localizedRetailPriceCents, mntRate);
    const isUnavailable = product.localizedRetailPriceCents?.amountCents === 0;

    return (
      <Link
        href={productLink}
        passHref
        className={`block h-full ${!product.slug ? 'pointer-events-none' : ''}`}
      >
        {/* COLOR CHANGE: bg-white border-neutral-700 -> bg-neutral-100 border-neutral-300, hover:border-neutral-600 -> hover:border-neutral-500 */}
        <div className="text-black bg-neutral-100 border border-neutral-300 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neutral-500 h-full flex flex-col group">
          {/* COLOR CHANGE: bg-neutral-900/80 border-neutral-700 -> bg-neutral-300/80 border-neutral-400 */}
          <div className="block w-full text-xs font-bold flex items-center p-2 bg-neutral-300/80 backdrop-blur-sm border-b border-neutral-400">
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
                unoptimized
                sizes="50vw"
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    // COLOR CHANGE: bg-neutral-800 text-neutral-500 -> bg-neutral-200 text-neutral-600
                    placeholder.className = 'w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-xs rounded-b-lg';
                    placeholder.innerText = 'Image Error';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              // COLOR CHANGE: bg-neutral-800 text-neutral-500 -> bg-neutral-200 text-neutral-600
              <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600 text-xs rounded-b-lg">
                No Image
              </div>
            )}
          </div>
          {/* COLOR CHANGE: border-neutral-700 -> border-neutral-300, group-hover:border-neutral-500 -> group-hover:border-neutral-400 */}
          <div className="w-full text-xs font-bold flex items-center p-3 border-t border-neutral-300 justify-center text-center relative group-hover:border-neutral-400 transition-colors duration-300">
            <span className="truncate">{replaceText(productName)}</span>
          </div>
        </div>
      </Link>
    );
  },
);
MobileProductCard.displayName = 'MobileProductCard';

// --- NEW: Search Source Type ---
type SearchSource = 'new' | 'preow';

// --- Main Search Page Component ---
const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  // --- NEW STATES ---
  const [searchSource, setSearchSource] = useState<SearchSource>('new');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});
  const [availableFilters, setAvailableFilters] = useState<EbayFilters | null>(null);
  // --- END NEW STATES ---

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mntRate, setMntRate] = useState<number | null>(null);
  const [totalResults, setTotalResults] = useState<number | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  // --- MODIFIED: fetchData (unchanged logic, kept for context) ---
  const fetchData = useCallback(
    async (
      pageNum: number,
      currentQuery: string | null,
      source: SearchSource,
      filters: Record<string, string[]>,
    ): Promise<FetchDataResponse | null> => {
      if (!currentQuery) {
        setError('Invalid search query.');
        return null;
      }

      // Determine API endpoint
      const apiPath = source === 'new' ? '/api/search' : '/api/search/ebay';
      const url = new URL(apiPath, window.location.origin);
      
      url.searchParams.set('query', currentQuery);
      url.searchParams.set('page', String(pageNum));
      url.searchParams.set('page_limit', String(RESULTS_PER_PAGE));

      // Append filters
      Object.entries(filters).forEach(([key, values]) => {
        values.forEach(value => {
          url.searchParams.append(key, value);
        });
      });

      try {
        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Search request failed');
        }

        if (!result.data) {
          throw new Error('No data received from search API');
        }

        return {
          results: result.data.products,
          hasMore: result.data.hasMore,
          totalResults: result.data.totalCount,
          filters: result.data.filters || null, // --- MODIFIED: Pass filters ---
        };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unknown error occurred during fetch';
        console.error('Fetch Data Error:', message);
        setError(message);
        return null;
      }
    },
    [],
  );

  // --- MODIFIED: loadMoreProducts (unchanged logic, kept for context) ---
  const loadMoreProducts = useCallback(async () => {
    if (!query || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    // --- MODIFIED: Pass source and filters ---
    const response = await fetchData(nextPage, query, searchSource, appliedFilters);

    if (response) {
      if (response.results.length > 0) {
        setProducts((prev) => [...prev, ...response.results]);
        setPage(nextPage);
        setError(null);
      }
      setHasMore(response.hasMore && response.results.length > 0);
    }
    setIsLoadingMore(false);
  }, [query, page, hasMore, fetchData, isLoadingMore, searchSource, appliedFilters]); // --- MODIFIED: Added dependencies ---

  // --- (Your existing sentinelRef) ---
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadMoreProducts();
          }
        },
        { threshold: 0.5 },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, isLoadingMore, hasMore, loadMoreProducts],
  );

  // --- (Your existing currency fetch useEffect) ---
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const res = await fetch(
          'https://hexarate.paikama.co/api/rates/latest/USD?target=MNT',
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const currencyResult = await res.json();
        if (currencyResult.status_code === 200 && currencyResult.data?.mid) {
          setMntRate(currencyResult.data.mid);
        } else {
          console.warn('MNT rate not available or invalid format from API');
        }
      } catch (err) {
        console.error('Currency fetch error:', err);
        setError((prevError) =>
          prevError
            ? `${prevError}\nFailed to load currency rate.`
            : 'Failed to load currency rate.',
        );
      }
    };
    fetchCurrencyData();
  }, []);

  // --- MODIFIED: Initial data load useEffect (unchanged logic, kept for context) ---
  useEffect(() => {
    const loadInitialData = async () => {
      if (!query) {
        setProducts([]);
        setIsLoading(false);
        setHasMore(false);
        setTotalResults(0);
        setError(null);
        setAvailableFilters(null); // --- NEW: Clear filters ---
        return;
      }

      setIsLoading(true);
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      setTotalResults(null);
      setAvailableFilters(null); // --- NEW: Clear filters ---

      // --- MODIFIED: Pass source and filters ---
      const response = await fetchData(1, query, searchSource, appliedFilters);

      if (response) {
        setProducts(response.results);
        setHasMore(response.hasMore && response.results.length > 0);
        if (response.totalResults !== undefined) {
          setTotalResults(response.totalResults);
        }
        // --- NEW: Set available filters ---
        if (response.filters) {
          setAvailableFilters(response.filters);
        }
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, [query, fetchData, searchSource, appliedFilters]); // --- MODIFIED: Added dependencies ---

  // --- (Your existing replaceText function) ---
  const replaceText = (text: string): string => {
    try {
      return String(text || '')
        .replace(/GOAT/gi, 'sainto')
        .replace(/Canada/gi, 'MONGOLIA');
    } catch (e) {
      console.error('Error replacing text:', text, e);
      return text || '';
    }
  };

  // --- NEW: Handler for filter changes (unchanged logic, kept for context) ---
  const handleFilterChange = (filterId: string, value: string, isChecked: boolean) => {
    setAppliedFilters(prev => {
      // --- THIS IS THE FIX ---
      // Standardize the category filter ID to 'categoryIds'
      // This makes it robust whether the FilterPanel sends 'categoryId' or 'categoryIds'
      const effectiveFilterId = (filterId === 'categoryId' || filterId === 'categoryIds') 
                                ? 'categoryIds' 
                                : filterId;

      const currentValues = prev[effectiveFilterId] || [];
      let newValues: string[];

      if (isChecked) {
        // For categories, we only allow one selection
        if (effectiveFilterId === 'categoryIds') { // Check against the standardized ID
          newValues = [value];
        } else {
          // For aspects, allow multiple
          newValues = [...currentValues, value];
        }
      } else {
        newValues = currentValues.filter(v => v !== value);
      }

      // If no values left, remove key
      if (newValues.length === 0) {
        const rest = { ...prev };
        delete rest[effectiveFilterId];
        return rest;
      }
      
      return {
        ...prev,
        [effectiveFilterId]: newValues,
      };
    });
  };

  // --- NEW: Handler for search source change (unchanged logic, kept for context) ---
  const handleSourceChange = (source: SearchSource) => {
    if (source === searchSource) return;
    setSearchSource(source);
    setAppliedFilters({}); // Clear filters when switching source
    setAvailableFilters(null);
    setProducts([]);
    setPage(1);
    setTotalResults(null);
  };


  const displayQuery = query ? `"${query}"` : '';
  let resultsCountText = '';
  if (!isLoading && totalResults !== null) {
    resultsCountText = `${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}`;
  } else if (!isLoading && products.length > 0 && !totalResults) {
    resultsCountText = `${products.length.toLocaleString()}${hasMore ? '+' : ''} results`;
  }

  return (
    // COLOR CHANGE: bg-neutral-900 text-white -> bg-neutral-100 text-black
    <div className="min-h-screen bg-white text-black p-0 md:p-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* COLOR CHANGE: text-white -> text-black, text-neutral-400 -> text-neutral-600 */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-4">
          Search Results for {displayQuery && <span className="text-neutral-600"> {displayQuery}</span>}
        </h1>

        {/* --- NEW: Search Source Tabs --- */}
        {/* COLOR CHANGE: border-neutral-700 -> border-neutral-300 */}
        <div className="flex space-x-2 border-b border-neutral-300 mb-6">
          <button
            className={`py-3 px-4 text-sm font-medium ${
              // COLOR CHANGE: border-white text-white -> border-black text-black, text-neutral-400 hover:text-white -> text-neutral-600 hover:text-black
              searchSource === 'new'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-600 hover:text-black'
            }`}
            onClick={() => handleSourceChange('new')}
          >
            New Products
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium ${
              // COLOR CHANGE: border-white text-white -> border-black text-black, text-neutral-400 hover:text-white -> text-neutral-600 hover:text-black
              searchSource === 'preow'
                ? 'border-b-2 border-black text-black'
                : 'text-neutral-600 hover:text-black'
            }`}
            onClick={() => handleSourceChange('preow')}
          >
            Pre-Owned
          </button>
        </div>
        {/* --- END NEW: Search Source Tabs --- */}

        {/* --- NEW: Main content layout (Filters + Results) --- */}
        <div className="flex flex-col md:flex-row">
          {/* --- NEW: Filter Panel (Uses its own styles, but it's nested here) --- */}
          {searchSource === 'preow' && (
            <FilterPanel
              filters={availableFilters}
              appliedFilters={appliedFilters}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* --- NEW: Results Area (wrapper) --- */}
          <div className="flex-1">
            {isLoading && (
              <>
                {/* COLOR CHANGE: bg-neutral-700 -> bg-neutral-300 */}
                <div className="h-4 w-1/3 md:w-1/4 bg-neutral-300 rounded mb-4 animate-pulse"></div>
                <SearchResultsSkeleton count={RESULTS_PER_PAGE} />
              </>
            )}

            {!isLoading && error && products.length === 0 && (
              <div className="text-center py-10">
                {/* COLOR CHANGE: text-red-400 -> text-red-600, text-neutral-400 -> text-neutral-700 */}
                <h2 className="text-xl font-semibold text-red-600 mb-2">Search Error</h2>
                <p className="text-neutral-700">{error}</p>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && query && (
              <div className="text-center py-10">
                {/* COLOR CHANGE: text-neutral-300 -> text-neutral-700, text-neutral-500 -> text-neutral-600 */}
                <h2 className="text-xl font-semibold text-neutral-700 mb-2">No Results Found</h2>
                <p className="text-neutral-600">
                  We couldn&apos;t find any products matching your search for {displayQuery}.
                </p>
                <p className="text-neutral-600 mt-1">Try a different search term or check your spelling.</p>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && !query && (
              <div className="text-center py-10">
                {/* COLOR CHANGE: text-neutral-300 -> text-neutral-700, text-neutral-500 -> text-neutral-600 */}
                <h2 className="text-xl font-semibold text-neutral-700 mb-2">Start Your Search</h2>
                <p className="text-neutral-600">Please enter a search term in the bar above to find products.</p>
              </div>
            )}

            {!isLoading && products.length > 0 && (
              <>
                {/* COLOR CHANGE: text-neutral-400 -> text-neutral-600 */}
                {resultsCountText && (
                  <p className="text-neutral-600 text-sm mb-4">{resultsCountText}</p>
                )}
                {/* --- MODIFIED: Grid cols for when filter panel is visible (unchanged logic) --- */}
                <div className={`grid grid-cols-2 sm:grid-cols-2 ${
                    searchSource === 'preow' 
                    ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  } gap-2 md:gap-2`}>
                  {products.map((item, idx) => (
                    <div key={item.id || `product-${idx}`}>
                      <div className="block md:hidden h-full">
                        <MobileProductCard
                          product={item}
                          mntRate={mntRate}
                          replaceText={replaceText}
                          index={idx}
                        />
                      </div>
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
                {hasMore && (
                  <div
                    ref={sentinelRef}
                    style={{ height: '50px', width: '100%' }}
                    aria-hidden="true"
                  ></div>
                )}
              </>
            )}

            {isLoadingMore && (
              <div className="text-center my-8 flex justify-center items-center space-x-2">
                {/* COLOR CHANGE: border-neutral-300 -> border-neutral-600, text-neutral-400 -> text-neutral-600 */}
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600"></div>
                <p className="text-neutral-600">Loading more...</p>
              </div>
            )}

            {!isLoadingMore && error && products.length > 0 && !error.includes('currency rate') && (
              <div className="text-center my-8">
                {/* COLOR CHANGE: text-red-400 -> text-red-600 */}
                <p className="text-red-600">Error loading more: {error.replace('API Error: ', '')}</p>
              </div>
            )}

            {!isLoading && !isLoadingMore && !hasMore && products.length > 0 && (
              <div className="text-center my-8">
                {/* COLOR CHANGE: text-neutral-500 -> text-neutral-600 */}
                <p className="text-neutral-600">You&apos;ve reached the end of the results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- (Your existing Suspense wrapper) ---
const SearchPageWithSuspense = () => (
  <Suspense
    fallback={
      // COLOR CHANGE: text-white -> text-black
      <div className="min-h-screen text-black p-0 md:p-0">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* COLOR CHANGE: bg-neutral-700 -> bg-neutral-300 */}
          <div className="h-8 md:h-9 w-3/4 md:w-1/2 bg-neutral-300 rounded mb-6 md:mb-8 animate-pulse"></div>
          {/* --- NEW: Added tabs pulse --- */}
          {/* COLOR CHANGE: border-neutral-700 -> border-neutral-300, bg-neutral-700 -> bg-neutral-300, bg-neutral-800 -> bg-neutral-400 */}
          <div className="flex space-x-2 border-b border-neutral-300 mb-6">
             <div className="py-3 px-4 h-10 w-24 bg-neutral-300 rounded-t"></div>
             <div className="py-3 px-4 h-10 w-24 bg-neutral-400 rounded-t"></div>
          </div>
          {/* COLOR CHANGE: bg-neutral-700 -> bg-neutral-300 */}
          <div className="h-4 w-1/3 md:w-1/4 bg-neutral-300 rounded mb-4 animate-pulse"></div>
          <SearchResultsSkeleton count={RESULTS_PER_PAGE} />
        </div>
      </div>
    }
  >
    <SearchPage />
    <style>{`
        // COLOR CHANGE: #171717 -> #ffffff
        body {
          background-color: #ffffff; 
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .font-playfair-display {
          font-family: 'Playfair Display', serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
  </Suspense>
);

export default SearchPageWithSuspense;

