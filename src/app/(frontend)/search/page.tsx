'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const RESULTS_PER_PAGE = 12;

// --- Interfaces ---
interface ProductVariant {
  id?: string;
  size?: string;
  color?: string;
  stock?: number;
  sku?: string;
  priceCents?: number;
  [key: string]: unknown;
}

interface Product {
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
  };
  error?: string;
}

interface FetchDataResponse {
  results: Product[];
  hasMore: boolean;
  totalResults: number;
}

// --- Skeleton Components (Styled like Home.tsx) ---
const ProductCardSkeleton = () => (
  <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative h-full flex flex-col animate-pulse group">
    {/* Mobile-like top bar placeholder for price */}
    <div className="block md:hidden p-2 bg-neutral-800 border-b border-neutral-700">
      <div className="h-4 w-1/2 mx-auto bg-neutral-700 rounded"></div>
    </div>

    {/* Image Area */}
    <div
      className="overflow-hidden relative flex-grow bg-neutral-800 md:rounded-none rounded-b-lg"
      style={{ aspectRatio: '1 / 1' }}
    ></div>

    {/* Bottom Info Bar */}
    {/* Desktop Bottom Bar */}
    <div className="hidden md:flex w-full text-xs font-bold items-center p-4 border-t border-neutral-700 justify-between relative">
      <div className="h-4 bg-neutral-700 rounded w-2/3 mr-4"></div>
      <div className="h-8 w-[90px] bg-neutral-700 rounded-full"></div>
    </div>

    {/* Mobile Bottom Bar */}
    <div className="block md:hidden w-full text-xs font-bold p-3 border-t border-neutral-700 text-center">
      <div className="h-4 bg-neutral-700 rounded w-3/4 mx-auto"></div>
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

// --- Product Card Components (Styled like Home.tsx) ---
interface ProductCardProps {
  product: Product;
  mntRate: number | null;
  replaceText: (text: string) => string;
  index: number;
}

const renderPriceHelper = (
  localizedRetailPriceCents: { amountCents: number; currency: string } | null | undefined,
  mntRate: number | null,
): string => {
  if (!localizedRetailPriceCents?.amountCents) return 'N/A';
  if (mntRate === null) return '...';
  if (localizedRetailPriceCents.amountCents === 0) return 'Unavailable';
  
  const price = (localizedRetailPriceCents.amountCents * mntRate) / 100;
  return `₮${Math.ceil(price).toLocaleString('en-US')}`;
};

// --- Desktop Product Card ---
const DesktopProductCard = memo(
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
                unoptimized
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

// --- Mobile Product Card ---
const MobileProductCard = memo(
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
                unoptimized
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

// --- Main Search Page Component ---
const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mntRate, setMntRate] = useState<number | null>(null);
  const [totalResults, setTotalResults] = useState<number | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchData = useCallback(
    async (
      pageNum: number,
      currentQuery: string | null,
    ): Promise<FetchDataResponse | null> => {
      if (!currentQuery) {
        setError('Invalid search query.');
        return null;
      }

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(currentQuery)}&page=${pageNum}`);
        
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

  const loadMoreProducts = useCallback(async () => {
    if (!query || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const response = await fetchData(nextPage, query);

    if (response) {
      if (response.results.length > 0) {
        setProducts((prev) => [...prev, ...response.results]);
        setPage(nextPage);
        setError(null);
      }
      setHasMore(response.hasMore && response.results.length > 0);
    }
    setIsLoadingMore(false);
  }, [query, page, hasMore, fetchData, isLoadingMore]);

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

  const displayQuery = query ? `"${query}"` : '';
  let resultsCountText = '';
  if (!isLoading && totalResults !== null) {
    resultsCountText = `${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}`;
  } else if (!isLoading && products.length > 0 && !totalResults) {
    resultsCountText = `${products.length.toLocaleString()}${hasMore ? '+' : ''} results`;
  }

  return (
    <div className="min-h-screen text-white p-0 md:p-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8">
          Search Results for {displayQuery && <span className="text-neutral-400"> {displayQuery}</span>}
        </h1>

        {isLoading && (
          <>
            <div className="h-4 w-1/3 md:w-1/4 bg-neutral-700 rounded mb-4 animate-pulse"></div>
            <SearchResultsSkeleton count={RESULTS_PER_PAGE} />
          </>
        )}

        {!isLoading && error && products.length === 0 && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Search Error</h2>
            <p className="text-neutral-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && query && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-neutral-300 mb-2">No Results Found</h2>
            <p className="text-neutral-500">
              We couldn&apos;t find any products matching your search for {displayQuery}.
            </p>
            <p className="text-neutral-500 mt-1">Try a different search term or check your spelling.</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && !query && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-neutral-300 mb-2">Start Your Search</h2>
            <p className="text-neutral-500">Please enter a search term in the bar above to find products.</p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <>
            {resultsCountText && (
              <p className="text-neutral-400 text-sm mb-4">{resultsCountText}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-2">
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-300"></div>
            <p className="text-neutral-400">Loading more...</p>
          </div>
        )}

        {!isLoadingMore && error && products.length > 0 && !error.includes('currency rate') && (
          <div className="text-center my-8">
            <p className="text-red-400">Error loading more: {error.replace('API Error: ', '')}</p>
          </div>
        )}

        {!isLoading && !isLoadingMore && !hasMore && products.length > 0 && (
          <div className="text-center my-8">
            <p className="text-neutral-500">You&apos;ve reached the end of the results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchPageWithSuspense = () => (
  <Suspense
    fallback={
      <div className="min-h-screen text-white p-0 md:p-0">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="h-8 md:h-9 w-3/4 md:w-1/2 bg-neutral-700 rounded mb-6 md:mb-8 animate-pulse"></div>
          <div className="h-4 w-1/3 md:w-1/4 bg-neutral-700 rounded mb-4 animate-pulse"></div>
          <SearchResultsSkeleton count={RESULTS_PER_PAGE} />
        </div>
      </div>
    }
  >
    <SearchPage />
  </Suspense>
);

export default SearchPageWithSuspense;