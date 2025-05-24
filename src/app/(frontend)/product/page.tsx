'use client';
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useProductContext } from '../../context/ProductContext'; // Assuming this context exists and is setup
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

// --- Interface Definitions ---
type SectionRefs = Record<string, React.RefObject<HTMLDivElement | null>>; // Keep null possibility here

interface ItemData {
  id: string;
  slug: string;
  image_url: string;
  lowest_price_cents: number;
}

interface Item {
  data: ItemData;
  value: string; // Usually product name from API
  category: string; // Category name derived during processing
  categoryUrl: string; // Category URL derived during processing
}

interface CollectionDoc {
  url: string;
  order: number; // Add other potential fields from your /api/payload/collections response
}

// Interface for the expected structure of API responses from ac.cnstrc.com
interface ApiCollectionResponse {
    response?: {
      collection?: {
        display_name?: string;
        id?: string;
      };
      results?: Array<{
        data: ItemData;
        value: string;
      }>;
      facets?: {
        group_id?: {
          values?: Array<{
            value: string;
            display_name: string;
            count: number;
          }>;
        };
      };
      request?: {
        term?: string;
        browse_filter_value?: string;
        // Either specify known properties or use unknown
        filters?: Record<string, string>;
        sort_by?: string;
        sort_order?: string;
        // Or if truly dynamic:
        [key: string]: unknown;
      };
    };
    // For top-level properties
    metadata?: unknown;
    errors?: unknown;
    [key: string]: unknown; // Safer than any
  }

// --- In-Memory Cache Implementation ---
interface HomeCache {
  data: { [key: string]: Item[] } | null;
  // Use refined type matching ProductCategoryUrls keys
  categoryData: { [key in keyof typeof ProductCategoryUrls]?: { [key: string]: Item[] } } | null;
  mntRate: number | null;
  collections: CollectionDoc[] | null;
  timestamp: number | null; // Timestamp for cache validation
}

// URLs for fetching category preview items (grouped by 'el' key for rendering logic)
// Define this *before* HomeCache interface if used there directly, or ensure definition order allows it.
const ProductCategoryUrls = { // Make this const
    el1: [ /* Your el1 URLs */ 'https://ac.cnstrc.com/browse/group_id/sneakers?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631177301', 'https://ac.cnstrc.com/browse/group_id/apparel?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631218652', 'https://ac.cnstrc.com/browse/group_id/bags?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631248845', 'https://ac.cnstrc.com/browse/group_id/accessories?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=1&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631270463', ],
    el2: [ /* Your el2 URLs */ 'https://ac.cnstrc.com/browse/group_id/sneakers?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631433696', 'https://ac.cnstrc.com/search/wmns?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&filters%5Bis_in_stock%5D=True&filters%5Bweb_groups%5D=sneakers&sort_by=relevance&sort_order=descending&_dt=1741631475282', 'https://ac.cnstrc.com/search/gs?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631496746', 'https://ac.cnstrc.com/search/PS?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631510849', ],
    el3: [ /* Your el3 URLs */ 'https://ac.cnstrc.com/browse/collection_id/vintage-2023?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631719966', 'https://ac.cnstrc.com/browse/collection_id/instant?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741631771793', 'https://ac.cnstrc.com/search/Tee?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&filters%5Bproduct_condition%5D=new_no_defects&sort_by=relevance&sort_order=descending&_dt=1741631831801', 'https://ac.cnstrc.com/search/Hoodies?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&filters%5Bproduct_condition%5D=new_no_defects&sort_by=relevance&sort_order=descending&_dt=1741631856430', ],
    el4: [ /* Your el4 URLs */ 'https://ac.cnstrc.com/browse/group_id/hats?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&filters%5Bgroup_id%5D=hats&sort_by=relevance&sort_order=descending&_dt=1741632002858', 'https://ac.cnstrc.com/browse/group_id/eyewear?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&filters%5Bgroup_id%5D=eyewear&sort_by=relevance&sort_order=descending&_dt=1741632030400', 'https://ac.cnstrc.com/browse/group_id/tops?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741632052607', 'https://ac.cnstrc.com/browse/group_id/bottoms?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741632082882', ],
    el5: [ /* Your el5 URLs */ 'https://ac.cnstrc.com/browse/group_id/sneakers?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741632131690', 'https://ac.cnstrc.com/browse/brand/nike?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741632162861', 'https://ac.cnstrc.com/search/ADIDAS?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741632196921', 'https://ac.cnstrc.com/search/Jordan?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=34&page=1&num_results_per_page=3&sort_by=relevance&sort_order=descending&_dt=1741632226626', ],
};

// Define cache object OUTSIDE the component scope
let homeCache: HomeCache = { data: null, categoryData: null, mntRate: null, collections: null, timestamp: null };

// Define how long the cache is considered valid (e.g., 5 minutes)
const CACHE_DURATION_MS = 5 * 60 * 1000;

// Helper function to check cache validity
const isCacheValid = (cacheTimestamp: number | null): boolean => {
  if (!cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION_MS;
};

// --- Skeleton Loading Components ---
// Skeleton for standard product cards (Desktop Grid / Mobile Swiper)
const SkeletonCard = () => (
  <div className="text-white bg-neutral-800 border border-neutral-700 rounded tracking-tight relative h-full flex flex-col animate-pulse">
    {/* Mimic Mobile Price Bar */}
    <div className="block lg:hidden h-8 w-full bg-neutral-700 border-b border-neutral-600"></div>
    <div className="overflow-hidden rounded rounded-b-none relative flex-grow bg-neutral-700" style={{ aspectRatio: '1 / 1' }}></div>
    {/* Mimic Bottom Bar (Desktop Price / Name, Mobile Name) */}
    <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative">
      <div className="h-4 bg-neutral-600 rounded w-3/4 mr-4"></div>
      {/* Desktop Price Button Placeholder */}
      <div className="hidden lg:block h-8 w-[90px] bg-neutral-600 rounded-full"></div>
    </div>
  </div>
);

// Skeleton for Category Cards (Reverted white background style)
const SkeletonCategoryCard = () => (
  <div className="text-black rounded tracking-tight relative bg-neutral-300 border border-neutral-400 animate-pulse h-fit">
    {/* Header Placeholder */}
    <div className="w-full flex justify-between items-center text-xl font-bold bg-neutral-200 p-4 border-b border-neutral-400 mt-0 relative">
      <div className="h-6 bg-neutral-400 rounded w-1/2"></div>
      <div className="h-5 w-5 bg-neutral-400 rounded"></div>
    </div>
    {/* Image Area Placeholder */}
    <div className="relative overflow-hidden border border-neutral-400 bg-neutral-300" style={{ aspectRatio: '1/1' }}>
      <div className="absolute w-full h-full bg-neutral-400 rounded"></div>
    </div>
  </div>
);

// --- Memoized Child Components ---
// Props for DesktopItem
interface DesktopItemProps {
  item: Item;
  renderPrice: (priceCents: number) => string;
  replaceText: (text: string) => string;
  priority: boolean;
}

// Memoized DesktopItem Component
const DesktopItem = memo(({ item, renderPrice, replaceText, priority }: DesktopItemProps) => {
  return (
    <Link href={`/product/${item.data.slug}`} passHref>
      <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
        {/* ImageContainer */}
        <div className="overflow-hidden rounded-t-lg relative flex-grow" style={{ aspectRatio: '1/1' }}>
          <Image
            className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
            src={item.data.image_url}
            alt={replaceText(item.value)}
            fill
            unoptimized
            sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 20vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
        {/* BottomInfoBar */}
        <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
          <span className="truncate pr-2">{replaceText(item.value)}</span>
          <div className={`py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden ${
            item.data.lowest_price_cents === 0 
              ? 'bg-neutral-800 border border-neutral-700 text-neutral-400' 
              : 'bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500'
          }`}>
            {item.data.lowest_price_cents === 0 ? (
              <span className="block">Unavailable</span>
            ) : (
              <>
                <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
                  {renderPrice(item.data.lowest_price_cents)}
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
});
DesktopItem.displayName = 'DesktopItem'; // For better debugging

// Props for MobileItem
interface MobileItemProps {
  item: Item;
  renderPrice: (priceCents: number) => string;
  replaceText: (text: string) => string;
  priority: boolean;
}

// Memoized MobileItem Component (Reverted Design)
const MobileItem = memo(({ item, renderPrice, replaceText, priority }: MobileItemProps) => {
  return (
    <Link href={`/product/${item.data.slug}`} passHref>
      <div className="text-white bg-black border border-neutral-800 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neutral-600 h-full flex flex-col group">
        {/* TopPriceBar */}
        <div className="block w-full text-xs font-bold flex items-center p-2 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-700">
          <span className="block">
            {item.data.lowest_price_cents === 0 ? 'Unavailable' : renderPrice(item.data.lowest_price_cents)}
          </span>
        </div>
        {/* ImageContainer */}
        <div className="overflow-hidden rounded-b-lg relative flex-grow" style={{ aspectRatio: '1/1' }}>
          <Image
            className="rounded-b-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
            src={item.data.image_url}
            alt={replaceText(item.value)}
            fill
            unoptimized
            sizes="60vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
        {/* BottomProductNameBar */}
        <div className="w-full text-xs font-bold flex items-center p-3 border-t border-neutral-700 justify-center text-center relative group-hover:border-neutral-500 transition-colors duration-300">
          <span className="truncate">{replaceText(item.value)}</span>
        </div>
      </div>
    </Link>
  );
});
MobileItem.displayName = 'MobileItem'; // For better debugging

// Props for CategoryCard
interface CategoryCardProps {
  label: string;
  items: Item[]; // Array containing 1-3 items for this preview
  replaceText: (text: string) => string;
  priority: boolean;
}

// Memoized CategoryCard Component (Reverted Design)
const CategoryCard = memo(({ label, items, replaceText, priority }: CategoryCardProps) => {
  const firstItem = items?.[0];
  const secondItem = items?.[1];
  const thirdItem = items?.[2];

  // Only render the card if there's at least one item
  if (!firstItem) return null;

  const categoryUrl = firstItem?.categoryUrl || '#';

  return (
    <div className="text-black rounded tracking-tight relative bg-white border border-neutral-700 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-neutral-400 h-fit flex flex-col group">
      {/* Category Header Link */}
      <Link href={categoryUrl} passHref>
        <div className="w-full flex justify-between items-center text-lg md:text-xl font-bold bg-white text-black p-4 border-b border-neutral-200 relative transition-colors duration-300 group-hover:bg-neutral-50">
          <span className="truncate pr-2">{replaceText(label)}</span>
          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 text-neutral-600 flex-shrink-0" />
        </div>
      </Link>
      {/* Image Collage Link Area */}
      <Link href={categoryUrl} passHref className="block flex-grow">
        <div className="relative overflow-hidden bg-black group-hover:bg-white transition-colors duration-300" style={{ aspectRatio: '1 / 1' }}>
          {/* Image 1 (Left) */}
          {firstItem && (
            <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start" style={{ zIndex: 1 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-105" style={{ width: '130%', height: '130%' }}>
                <Image
                  className="object-contain w-full h-full"
                  src={firstItem.data.image_url}
                  alt={`${label} product 1`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 30vw, 15vw"
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                />
              </div>
            </div>
          )}
          {/* Image 2 (Center/Middle - Larger) */}
          {secondItem && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-110" style={{ width: '75%', height: '75%' }}>
                <Image
                  className="object-contain w-full h-full drop-shadow-md"
                  src={secondItem.data.image_url}
                  alt={`${label} product 2`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 40vw, 20vw"
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                />
              </div>
            </div>
          )}
          {/* Image 3 (Right) */}
          {thirdItem && (
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end" style={{ zIndex: 1 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-105" style={{ width: '130%', height: '130%' }}>
                <Image
                  className="object-contain w-full h-full"
                  src={thirdItem.data.image_url}
                  alt={`${label} product 3`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 30vw, 15vw"
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});
CategoryCard.displayName = 'CategoryCard'; // For better debugging

// --- Main Home Component ---
const Home = () => {
  // --- State --- (Initialize from cache if valid)
  const [data, setData] = useState<{ [key: string]: Item[] }>(() => isCacheValid(homeCache.timestamp) && homeCache.data ? homeCache.data : {});
  // FIX: Use refined type for categoryData state
  const [categoryData, setCategoryData] = useState<{ [key in keyof typeof ProductCategoryUrls]?: { [key: string]: Item[] } }>(
    () => isCacheValid(homeCache.timestamp) && homeCache.categoryData ? homeCache.categoryData : {}
  );
  const [mntRate, setMntRate] = useState<number | null>(() => isCacheValid(homeCache.timestamp) ? homeCache.mntRate : null);
  const [collections, setCollections] = useState<CollectionDoc[]>(() => isCacheValid(homeCache.timestamp) && homeCache.collections ? homeCache.collections : []);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Start loading only if essential cache (e.g., collections or data) is invalid/missing
    const collectionsCached = isCacheValid(homeCache.timestamp) && homeCache.collections && homeCache.collections.length > 0;
    const dataCached = isCacheValid(homeCache.timestamp) && homeCache.data && Object.keys(homeCache.data).length > 0;
    return !(collectionsCached && dataCached); // If both core parts are cached, assume not initially loading
  });
  const [error, setError] = useState<string | null>(null);
  const { setPageData } = useProductContext(); // Assuming context provides a setter function
  const [visibleSections, setVisibleSections] = useState<string[]>([]); // IDs of sections currently in viewport
  const sectionRefs = useRef<SectionRefs>({}); // Use correct type SectionRefs

  // --- Helper Functions ---
  // Memoized function to replace text occurrences
  const replaceText = useCallback((text: string): string => {
    try {
      return String(text || '').replace(/GOAT/gi, 'SAINT').replace(/Canada/gi, 'MONGOLIA');
    } catch (e) {
      console.error("Error replacing text:", text, e);
      return text || '';
    }
  }, []);

  // Helper to render formatted price or loading state
  const renderPrice = (priceCents: number): string => {
    if (priceCents === 0) return 'Unavailable';
    if (mntRate === null) return '...';
    const price = (priceCents * mntRate) / 100;
    return `₮${Math.ceil(price).toLocaleString('en-US')}`;
  };

  // --- Data Fetching Effects with Caching ---
  // Effect 1: Fetch collections list (checks cache first)f
  useEffect(() => {
    // Use cache if valid
    if (isCacheValid(homeCache.timestamp) && homeCache.collections) {
      console.log("Using cached collections.");
      setCollections(homeCache.collections);
      return;
    }
  
    // Fetch collections if not cached or expired
    console.log("Fetching collections...");
    setIsLoading(true);
    setError(null);
    
    fetch("/api/payload/collections?sort=order")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((fetchedData) => {
        // Handle both direct array and {docs: [...]} formats
        const collectionsArray = Array.isArray(fetchedData) ? fetchedData : 
                              (fetchedData?.docs || []);
  
        if (!collectionsArray.length) {
          throw new Error("Received empty collections array");
        }
  
        // Clean URLs (fixes the space before "https" in first item)
        const cleanedCollections = collectionsArray.map((c: CollectionDoc) => ({
          ...c,
          url: c.url?.trim()
        }));
  
        const sortedCollections = [...cleanedCollections].sort((a, b) => a.order - b.order);
        
        setCollections(sortedCollections);
        homeCache.collections = sortedCollections;
        homeCache.timestamp = Date.now();
        console.log("Collections processed:", sortedCollections);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError(`Collections error: ${error instanceof Error ? error.message : String(error)}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Empty dependency array = runs once on mount

  // Effect 2: Fetch currency data (checks cache first)
  const fetchCurrencyData = useCallback(async (forceRefetch = false) => {
    // Use cache if valid and not forced
    if (!forceRefetch && isCacheValid(homeCache.timestamp) && homeCache.mntRate !== null) {
      console.log("Using cached MNT rate.");
      // If state is not already set (e.g., initial load with cache), set it
      if (mntRate !== homeCache.mntRate) {
        setMntRate(homeCache.mntRate);
      }
      return homeCache.mntRate;
    }

    // Fetch if not cached, expired, or forced
    console.log(forceRefetch ? "Forcing fetch MNT rate..." : "Fetching MNT rate...");
    // Setting isLoading might depend on whether this blocks rendering significantly
    // setIsLoading(true); // Maybe not needed here unless price is critical path immediately
    try {
      // Ulaanbaatar is in Mongolia, MNT is the currency.
      const res = await fetch('https://hexarate.paikama.co/api/rates/latest/USD?target=MNT');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const currencyData = await res.json();

      if (currencyData.status_code === 200 && currencyData.data?.mid) {
        const rate = currencyData.data.mid;
        setMntRate(rate); // Update state
        homeCache.mntRate = rate; // Update cache
        homeCache.timestamp = Date.now(); // Update shared timestamp
        console.log("MNT rate fetched and cached.");
        return rate;
      } else {
        throw new Error('MNT rate not available or invalid format in response');
      }
    } catch (error: unknown) { // FIX: Use unknown instead of any
      console.error('Failed to fetch currency data:', error);
      // FIX: Use type assertion or check for error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError((prevError) => prevError ? `${prevError}\nFailed to fetch currency: ${errorMessage}` : `Failed to fetch currency: ${errorMessage}`);
      const fallbackRate = 1; // Use fallback
      setMntRate(fallbackRate);
      // Decide whether to cache the fallback rate. Caching it might hide future successful fetches until expiry.
      // homeCache.mntRate = fallbackRate; // Optionally cache fallback
      // homeCache.timestamp = Date.now();
      return fallbackRate;
    } finally {
      // setIsLoading(false); // Stop loading if it was set
    }
  }, [mntRate]); // Dependency ensures we don't re-run if mntRate already has the cached value

  // Effect 3: Fetch all product/category data (checks cache first)
  const fetchAllData = useCallback(async (currentCollections: CollectionDoc[], currentMntRate: number, forceRefetch = false) => {
    // Use cache if valid and not forced
    if (!forceRefetch && isCacheValid(homeCache.timestamp) && homeCache.data && homeCache.categoryData) {
      console.log("Using cached homepage data (products/categories).");
      // Update state from cache only if it differs (might be set by useState initial already)
      if (data !== homeCache.data) setData(homeCache.data);
      // Type assertion needed if initial state type differs subtly from cache type after refinement
      if (categoryData !== homeCache.categoryData) setCategoryData(homeCache.categoryData as { [key in keyof typeof ProductCategoryUrls]?: { [key: string]: Item[] } });
      if (setPageData) setPageData(homeCache.data); // Update context from cache

      // Ensure refs are created/updated based on cached structure
      const newSectionRefs: SectionRefs = {}; // Use correct SectionRefs type
      Object.keys(homeCache.data).forEach((_, index) => {
        const sectionId = `section-${index}`;
        // This logic ensures that refs are created if they don't exist for cached data structure
        newSectionRefs[sectionId] = sectionRefs.current[sectionId] || React.createRef<HTMLDivElement>();
      });
      sectionRefs.current = newSectionRefs; // Assign the correctly typed object

      // Set initial visibility from cached data structure
      setVisibleSections(Object.keys(homeCache.data).slice(0, 3).map((_, i) => `section-${i}`));
      setIsLoading(false); // Data is ready from cache
      return; // Exit early
    }

    // Proceed with fetching if cache is invalid/missing/forced
    console.log(forceRefetch ? "Forcing fetch all page data..." : "Fetching all page data...");
    setIsLoading(true); // Now we are definitely loading network data
    setError(null);

    // Ensure we have collections and rate before proceeding (redundant check, but safe)
    if (currentCollections.length === 0 || currentMntRate === null) {
      console.warn("Attempted to fetchAllData without collections or mntRate.");
      setIsLoading(false);
      return;
    }

    try {
      const sortedCollections = [...currentCollections].sort((a, b) => a.order - b.order);

      // --- Fetch Main Collection Data ---
      const collectionPromises = sortedCollections.map(collection =>
        fetch(collection.url)
          .then(res => res.ok ? res.json() : Promise.reject(`Failed fetch ${collection.url}`))
          .catch(err => { console.warn(err); return null; })
      );
      const collectionResponses = await Promise.all(collectionPromises);

      const categorizedResults: { [key: string]: Item[] } = {};
      const tempRefs: SectionRefs = {}; // Use correct SectionRefs type for temp object

      collectionResponses.forEach((res: ApiCollectionResponse | null, index) => {
        if (!res?.response?.collection || !res.response.results) return;
        const collectionInfo = res.response.collection;
        const category = collectionInfo.display_name || `Collection ${index + 1}`;
        const categoryUrl = collectionInfo.id ? `/browse/collection_id/${collectionInfo.id}` : '#';

        categorizedResults[category] = res.response.results.map((item): Item => ({
          data: item.data,
          value: item.value,
          category: category,
          categoryUrl: categoryUrl,
        }));

        // Prepare ref for this section
        const sectionId = `section-${index}`;
        // Ensure ref exists in the main ref container (sectionRefs.current) or create it
        // RefObject.current can be null initially, which is fine for the SectionRefs type.
        if (!sectionRefs.current[sectionId]) {
          sectionRefs.current[sectionId] = React.createRef<HTMLDivElement>();
        }
        // Assign the existing or newly created RefObject to tempRefs
        tempRefs[sectionId] = sectionRefs.current[sectionId];
      });
      // This assignment should now work as tempRefs has the type SectionRefs
      sectionRefs.current = tempRefs;

      // --- Fetch Category Preview Data ---
      const categoryUrls = Object.values(ProductCategoryUrls).flat();
      const categoryPromises = categoryUrls.map(url =>
        fetch(url)
          .then(res => res.ok ? res.json() : Promise.reject(`Failed fetch ${url}`))
          .catch(err => { console.warn(err); return null; })
      );
      const categoryJsonData = await Promise.all(categoryPromises);

      // FIX: Ensure type matches state/cache type
      const categoryResults: { [key in keyof typeof ProductCategoryUrls]?: { [key: string]: Item[] } } = {};
      let categoryDataIndex = 0;

      Object.keys(ProductCategoryUrls).forEach((elKey) => {
        const currentElKey = elKey as keyof typeof ProductCategoryUrls; // Type assertion
        categoryResults[currentElKey] = {}; // Initialize inner object
        const urlsForEl = ProductCategoryUrls[currentElKey];

        urlsForEl.forEach((_, idx) => {
            const res = categoryJsonData[categoryDataIndex++] as ApiCollectionResponse | undefined;
            
            // Early return if no valid results
            if (!res?.response?.results?.length) return;
          
            // Determine label with type safety
            const label = determineLabel(res) ?? `Category ${idx + 1}`;
            const formattedLabel = formatLabel(label);
            
            // Determine URL with type safety
            const url = determineUrl(res);
          
            // Map products with proper typing
            const products: Item[] = res.response.results.slice(0, 3).map((product): Item => ({
              data: product.data,
              value: product.value || formattedLabel,
              category: formattedLabel,
              categoryUrl: url,
            }));
          
            // Safely assign to categoryResults
            if (products.length > 0 && categoryResults[currentElKey]) {
              categoryResults[currentElKey] = {
                ...categoryResults[currentElKey],
                [formattedLabel]: products
              };
            }
          });
          
          // Helper functions for better organization and type safety
          function determineLabel(res: ApiCollectionResponse): string | undefined {
            if (res.response?.collection?.display_name) {
              return res.response.collection.display_name;
            }
            if (res.response?.request?.browse_filter_value) {
              return res.response.request.browse_filter_value;
            }
            if (res.response?.request?.term) {
              return res.response.request.term;
            }
            if (res.response?.facets?.group_id?.values?.[0]?.display_name) {
              return res.response.facets.group_id.values[0].display_name;
            }
            return undefined;
          }
          
          function formatLabel(label: string): string {
            return label.charAt(0).toUpperCase() + label.slice(1);
          }
          
          function determineUrl(res: ApiCollectionResponse): string {
            if (res.response?.collection?.id) {
              return `/browse/collection_id/${res.response.collection.id}`;
            }
            if (res.response?.request?.term) {
              const groupValue = res.response.facets?.group_id?.values?.[0]?.value;
              return groupValue 
                ? `/browse/group_id/${groupValue}?q=${res.response.request.term}`
                : `/search/${res.response.request.term}`;
            }
            if (res.response?.facets?.group_id?.values?.[0]?.value) {
              return `/browse/group_id/${res.response.facets.group_id.values[0].value}`;
            }
            return '#';
          }
      });

      // --- Update State AND Cache ---
      setData(categorizedResults);
      setCategoryData(categoryResults);
      if (setPageData) setPageData(categorizedResults); // Update context
      homeCache.data = categorizedResults; // Cache data
      homeCache.categoryData = categoryResults; // Cache category previews
      homeCache.timestamp = Date.now(); // Update timestamp

      // Set initial visibility based on fetched data
      setVisibleSections(Object.keys(categorizedResults).slice(0, 3).map((_, i) => `section-${i}`));
      console.log("All page data fetched and cached.");

    } catch (err: unknown) { // FIX: Use unknown instead of any
      console.error('Error during data fetching process:', err);
       // FIX: Use type assertion or check for error message
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error fetching page data: ${errorMessage}.`);
      // Clear potentially partial cache? Or rely on expiry? For simplicity, let expiry handle it.
      // homeCache.data = null;
      // homeCache.categoryData = null;
    } finally {
      setIsLoading(false); // Ensure loading is set to false after all attempts
    }
  }, [setPageData, data, categoryData]); // Dependencies: context setter, state vars to prevent unnecessary updates

  // Effect 4: Trigger data fetching orchestration
  useEffect(() => {
    // Determine if essential data is ready from state (which might be from cache or fetch)
    const collectionsAvailable = collections.length > 0;
    const rateAvailable = mntRate !== null;

    // If collections are ready but rate isn't, fetch rate (it handles its own cache check)
    if (collectionsAvailable && !rateAvailable) {
      fetchCurrencyData();
    }

    // If both collections and rate are available in state, trigger main data fetch
    // (fetchAllData handles its own cache check)
    if (collectionsAvailable && rateAvailable) {
      fetchAllData(collections, mntRate);
    }
    // Note: This effect relies on Effect 1 setting `collections` state
    // and the call to `WorkspaceCurrencyData` setting `mntRate` state.
  }, [collections, mntRate, fetchCurrencyData, fetchAllData]); // Run when base data state changes

  // Effect 5: Setup Intersection Observer
  useEffect(() => {
    const currentRefs = sectionRefs.current; // Capture stable value for cleanup

    // If there are no refs yet (e.g., initial load or cache miss), don't setup observer
    if (Object.keys(currentRefs).length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id');
          if (id && entry.isIntersecting) {
            setVisibleSections((prev) => (prev.includes(id) ? prev : [...prev, id]));
          }
          // Optional: remove when not intersecting (can cause reflow on scroll up)
          // else if (id && !entry.isIntersecting) {
          //  setVisibleSections((prev) => prev.filter(visibleId => visibleId !== id));
          // }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '200px 0px 200px 0px' // Load slightly before/after viewport entry
      }
    );

    // Add null check when observing
    Object.values(currentRefs).forEach((refObject) => {
      if (refObject.current) { // This null check is sufficient
        observer.observe(refObject.current);
      }
    });

    return () => {
      Object.values(currentRefs).forEach((refObject) => {
        // Check refObject and refObject.current before trying to unobserve
        if (refObject?.current) {
          try {
             observer.unobserve(refObject.current);
          } catch (e) {
             console.warn("Error unobserving ref:", e);
          }
        }
      });
      observer.disconnect();
    };
    // FIX: Change dependency from sectionRefs.current to data
  }, [data]); // Re-run if the data driving the refs changes

  // --- Reset / Retry Logic ---
  const handleRetry = (forceRefetch = true) => {
    // Default to hard refresh on button click
    console.log(`Handling retry (forceRefetch: ${forceRefetch})`);
    setError(null); // Clear error state

    if (forceRefetch) {
      // Clear cache and state to force full reload
      console.log("Clearing cache and state for hard refresh.");
      homeCache = { data: null, categoryData: null, mntRate: null, collections: null, timestamp: null };
      setCollections([]);
      setMntRate(null);
      setData({});
      setCategoryData({});
      setVisibleSections([]); // Reset visible sections
      setIsLoading(true); // Start loading indicator immediately

      // Effect 1 will run due to empty collections state change (or just manually call it)
      // Let's manually trigger collection fetch for immediate effect
       fetch("/api/payload/collections?sort=order")
        .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
        .then(fetchedData => {
            if (!fetchedData || !Array.isArray(fetchedData.docs)) throw new Error("Invalid collections format");
            const fetchedCollections = fetchedData.docs as CollectionDoc[];
            setCollections(fetchedCollections); // Set state, triggers Effect 4
            homeCache.collections = fetchedCollections; // Cache it
            homeCache.timestamp = Date.now();
            console.log("Collections re-fetched after hard retry.");
            // Effect 4 will now see collections and trigger rate/all data fetch
        })
        .catch(error => {
            console.error("Error fetching collections on hard retry:", error);
            setError(`Failed to reload collections: ${(error as Error).message}.`); // Use type assertion
            setIsLoading(false);
        });

    } else {
      // Soft retry (less common for button, more for programmatic refresh)
      // Re-trigger the checks, which might hit cache or re-fetch expired
      console.log("Attempting soft refresh (checking cache validity again).");
      setIsLoading(true); // Show loading indicator during check/fetch
      if (collections.length === 0) {
        // Effect 1 logic should handle this, but could force it if needed
      } else if (mntRate === null) {
        fetchCurrencyData(false); // Check cache / fetch rate
      } else {
        fetchAllData(collections, mntRate, false); // Check cache / fetch all data
      }
    }
  };

    // Render the 4-column category preview section using memoized card
    const renderCategoryItems = useCallback((elKey: keyof typeof ProductCategoryUrls, sectionIndex: number) => {
      if (!categoryData[elKey] || Object.keys(categoryData[elKey]!).length === 0) return null;
  
      return (
          <div className="mt-16 md:mt-24">
              {/* Desktop Grid (unchanged) */}
              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(categoryData[elKey]!).map(([label, items], idx) => (
                      <CategoryCard
                          key={`${elKey}-${label}-${idx}`}
                          label={label}
                          items={items}
                          replaceText={replaceText}
                          priority={sectionIndex < 1 && idx < 4}
                      />
                  ))}
              </div>
  
              {/* Mobile Swiper - Improved Version */}
              <div className="block lg:hidden overflow-visible"> {/* Added overflow-visible */}
                  <Swiper
                      slidesPerView={1.3} // Slightly more than 1 slide visible
                      spaceBetween={20}
                      centeredSlides={false}
                      pagination={{
                          clickable: true,
                          dynamicBullets: true,
                          bulletClass: 'swiper-pagination-bullet', // Add custom class
                          bulletActiveClass: 'swiper-pagination-bullet-active' // Add custom active class
                      }}
                      modules={[Pagination]}
                      className="category-swiper -mx-4 px-4" // Increased negative margin
                      breakpoints={{
                          // Responsive breakpoints
                          640: {
                              slidesPerView: 1.5,
                              spaceBetween: 24
                          }
                      }}
                  >
                      {Object.entries(categoryData[elKey]!).map(([label, items], idx) => (
                          <SwiperSlide 
                              key={`${elKey}-${label}-${idx}-mobile`} 
                              className="h-auto pb-10" // Added padding for pagination
                          >
                              <div className="w-full h-full">
                                  <CategoryCard
                                      label={label}
                                      items={items}
                                      replaceText={replaceText}
                                      priority={sectionIndex < 1 && idx < 4}
                                  />
                              </div>
                          </SwiperSlide>
                      ))}
                  </Swiper>
              </div>
          </div>
      );
  }, [categoryData, replaceText]);


  // --- Conditional Rendering ---
  // Show skeletons only if actively loading AND have no data (not even stale cache)
 // Update the skeleton rendering in the loading state to match the new layout
if (isLoading && Object.keys(data).length === 0) {
  const skeletonSectionCount = (homeCache.collections && homeCache.collections.length > 0) 
    ? homeCache.collections.length 
    : 3;

  return (
    <div className="p-4 md:p-6">
      {[...Array(skeletonSectionCount)].map((_, index) => (
        <div key={`skeleton-section-${index}`} className="mb-12 md:mb-16">
          {/* Skeleton Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="h-7 md:h-8 w-1/2 md:w-1/3 bg-neutral-700 rounded-lg animate-pulse"></div>
            <div className="h-5 md:h-6 w-1/4 md:w-1/6 bg-neutral-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton Grid for Desktop */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <SkeletonCard key={`skeleton-card-${index}-${i}`} />)}
          </div>

          {/* Skeleton Swiper for Mobile */}
          <div className="block lg:hidden">
            <div className="relative">
              <div className="flex space-x-4 overflow-hidden">
                {[...Array(2)].map((_, i) => (
                  <div key={`skeleton-mobile-card-${index}-${i}`} className="min-w-[60%] md:min-w-[40%]">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Updated Skeleton for Category Items */}
          {index < 2 && (
            <div className="mt-16 md:mt-24">
              {/* Desktop Grid Skeleton */}
              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCategoryCard key={`skeleton-cat-desktop-${index}-${i}`} />
                ))}
              </div>
              
              {/* Mobile Swiper Skeleton */}
              <div className="block lg:hidden overflow-visible">
                <div className="relative">
                  <div className="flex space-x-4 -mx-4 px-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={`skeleton-cat-mobile-${index}-${i}`} className="min-w-[70%]">
                        <SkeletonCategoryCard />
                      </div>
                    ))}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-neutral-800 to-transparent pointer-events-none"></div>
                </div>
                {/* Pagination Placeholder */}
                <div className="flex justify-center mt-4">
                  <div className="h-2 w-2 bg-neutral-500 rounded-full mx-1"></div>
                  <div className="h-2 w-2 bg-neutral-700 rounded-full mx-1"></div>
                  <div className="h-2 w-2 bg-neutral-700 rounded-full mx-1"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

  // Error display
  if (error) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg text-red-300 max-w-md">
                <h2 className="text-xl font-semibold mb-3">Oops! Something went wrong.</h2>
                <p className="text-sm mb-4 whitespace-pre-line">{error}</p>
                <button
                    onClick={() => handleRetry(true)} // Force refetch on error retry
                    className="mt-4 bg-red-700 hover:bg-red-600 text-white py-2 px-5 rounded-lg transition-all font-semibold"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
  }

  // No Data display (after loading and no error)
  if (!isLoading && !error && Object.keys(data).length === 0) {
      return (
          <div className="flex items-center justify-center min-h-[60vh] p-6 text-center text-neutral-400">
              <div>
                  <h2 className="text-xl font-semibold mb-3">No Content Available</h2>
                  <p className="text-sm">Could not load any product collections at this time.</p>
                  <button
                      onClick={() => handleRetry(true)} // Force refetch
                      className="mt-4 bg-blue-700 hover:bg-blue-600 text-white py-2 px-5 rounded-lg transition-all font-semibold"
                  >
                      Retry Load
                  </button>
              </div>
          </div>
      );
  }

  // --- Main Successful Render --- (Uses state `data`, `categoryData` etc.)
  return (
    <div className="p-4 md:p-6">
        {Object.entries(data).map(([title, items], index) => {
            const sectionId = `section-${index}`;
            // Ensure ref exists (should be created during fetchAllData or cache load)
            if (!sectionRefs.current[sectionId]) {
                sectionRefs.current[sectionId] = React.createRef<HTMLDivElement>();
            }

            // Determine the corresponding key ('el1', 'el2', etc.) for category data
            const elKey = `el${Math.min(index + 1, 5)}` as keyof typeof ProductCategoryUrls; // Use Math.min to cap at 'el5'

            const shouldRenderContent = visibleSections.includes(sectionId);

            return (
                <section
                    key={sectionId}
                    className={`mb-12 md:mb-16 transition-opacity duration-700 ease-in-out ${shouldRenderContent ? 'opacity-100' : 'opacity-0'}`}
                    ref={sectionRefs.current[sectionId]}
                    data-section-id={sectionId}
                    style={{ minHeight: shouldRenderContent ? 'auto' : '400px' }} // Placeholder height
                    aria-label={replaceText(title)}
                >
                    {shouldRenderContent ? (
                        <>
                            {/* Section Header */}
                            <header className="flex justify-between items-center mb-6 md:mb-8">
                                <h2 className="font-extrabold text-white text-xl md:text-3xl relative truncate pr-4">
                                    {replaceText(title)}
                                </h2>
                                {items.length > 0 && items[0].categoryUrl && items[0].categoryUrl !== '#' && (
                                    <Link
                                        className="text-neutral-300 hover:text-white font-semibold text-xs md:text-sm underline whitespace-nowrap flex-shrink-0"
                                        href={items[0].categoryUrl.replace('/browse/collection_id', '/collections')} // Adjust URL if needed
                                        aria-label={`View all ${replaceText(title)}`}
                                    >
                                        View All
                                    </Link>
                                )}
                            </header>

                            {/* Mobile: Product Carousel */}
{/* Mobile: Product Carousel */}
<div className="block lg:hidden mb-8 relative"> {/* Added relative here */}
  {items.length > 0 ? (
    <Swiper
      slidesPerView={1.5}
      spaceBetween={16}
      pagination={{
        clickable: true,
        dynamicBullets: true,
        el: '.product-pagination', // Specify custom pagination container
      }}
      modules={[Pagination]}
      className="mySwiper -mx-1 px-1 pb-8" // Added pb-8 for pagination space
    >
      {items.map((item, idx) => (
        <SwiperSlide key={`${item.data.id}-mobile`} className="h-auto">
          <MobileItem 
            item={item} 
            renderPrice={renderPrice} 
            replaceText={replaceText} 
            priority={idx < 2}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  ) : (
    <p className="text-neutral-500 text-center py-4">No items found.</p>
  )}
  {/* Custom Pagination Container */}
  <div className="product-pagination absolute bottom-0 left-0 right-0 flex justify-center space-x-2 py-2"></div>
</div>

                            {/* Desktop: Product Grid */}
                            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                               {items.length > 0 ? (
                                   items.map((item, idx) => (
                                        <DesktopItem key={`${item.data.id}-desktop`} item={item} renderPrice={renderPrice} replaceText={replaceText} priority={idx < 5} />
                                    ))
                                ) : (
                                    <p className="text-neutral-500 col-span-full text-center py-4">No items found.</p>
                                )}
                            </div>

                            {/* Render Associated Category Previews */}
                            {/* Check categoryData[elKey] exists before trying to access its keys */}
                            {categoryData[elKey] && Object.keys(categoryData[elKey]!).length > 0 && (
                                renderCategoryItems(elKey, index)
                            )}
                        </>
                    ) : (
                        null // Render nothing if not visible (minHeight provides space)
                    )}
                </section>
            );
        })}
    </div>
  );
};

// Export with React.memo. Main benefit now comes from child memoization and caching.
export default memo(Home);