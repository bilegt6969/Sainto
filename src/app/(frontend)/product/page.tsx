'use client';
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useProductContext } from '../../context/ProductContext'; // Assuming this context exists and is setup
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
 import 'swiper/css';
import 'swiper/css/pagination';
 // Import Sanity client (adjust path as needed)
import { client as sanityClient } from '../../../../lib/sanity'; // e.g., if Home.tsx is in app/components/Home.tsx

// --- Interface Definitions ---
type SectionRefs = Record<string, React.RefObject<HTMLDivElement | null>>;

interface ItemData {
  id: string;
  slug: string;
  image_url: string;
  lowest_price_cents: number;
}

interface Item {
  data: ItemData;
  value: string; // Product name
  category: string; // Collection name / Sanity label
  categoryUrl: string; // Collection URL / Navigation URL for the category
}

interface CollectionDoc {
  url: string;
  order: number;
  // Add other potential fields from your /api/payload/collections response
}

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
    groups?: Array<{
      group_id: string;
      display_name: string;
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
      filters?: Record<string, string>;
      sort_by?: string;
      sort_order?: string;
    };
  };
  metadata?: unknown;
  errors?: unknown;
  [key: string]: unknown;
}

// --- New Interface for Processed Sanity Categories ---
interface ProcessedSanityCategory {
  id: string;
  label: string; // From Sanity elX.label (for CategoryCard title)
  items: Item[]; // Up to 3 product Items for CategoryCard's image collage.
                 // Each Item should have its 'categoryUrl' field set for CategoryCard's links.
}

// Sanity schema type (for what's fetched)
interface SanityProductCategoryUrlDoc {
  docCategory?: string; // Optional: if you have a main category name for the set
  order: number;
  el1?: { url: string; label: string };
  el2?: { url: string; label: string };
  el3?: { url: string; label: string };
  el4?: { url: string; label: string };
}


// --- In-Memory Cache Implementation ---
interface HomeCache {
  data: { [key: string]: Item[] } | null;
  categoryData: { [elKey: string]: ProcessedSanityCategory[] } | null; // UPDATED
  mntRate: number | null;
  collections: CollectionDoc[] | null;
  sanityNameMap: Map<string, string> | null; // Stores URL -> Sanity Name
  timestamp: number | null;
}

// REMOVED: const ProductCategoryUrls = { ... }; // This will be fetched from Sanity

let homeCache: HomeCache = {
  data: null,
  categoryData: null, // Initialized as null
  mntRate: null,
  collections: null,
  sanityNameMap: null,
  timestamp: null,
};

const CACHE_DURATION_MS = 5 * 60 * 1000;

const isCacheValid = (cacheTimestamp: number | null): boolean => {
  if (!cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION_MS;
};

// --- Skeleton Loading Components (assuming they remain unchanged) ---
const SkeletonCard = () => (
  <div className="text-white bg-neutral-800 border border-neutral-700 rounded tracking-tight relative h-full flex flex-col animate-pulse">
    <div className="block lg:hidden h-8 w-full bg-neutral-700 border-b border-neutral-600"></div>
    <div className="overflow-hidden rounded rounded-b-none relative flex-grow bg-neutral-700" style={{ aspectRatio: '1 / 1' }}></div>
    <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative">
      <div className="h-4 bg-neutral-600 rounded w-3/4 mr-4"></div>
      <div className="hidden lg:block h-8 w-[90px] bg-neutral-600 rounded-full"></div>
    </div>
  </div>
);

const SkeletonCategoryCard = () => (
  <div className="text-black rounded tracking-tight relative bg-neutral-300 border border-neutral-400 animate-pulse h-fit">
    <div className="w-full flex justify-between items-center text-xl font-bold bg-neutral-200 p-4 border-b border-neutral-400 mt-0 relative">
      <div className="h-6 bg-neutral-400 rounded w-1/2"></div>
      <div className="h-5 w-5 bg-neutral-400 rounded"></div>
    </div>
    <div className="relative overflow-hidden border border-neutral-400 bg-neutral-300" style={{ aspectRatio: '1 / 1' }}>
      <div className="absolute w-full h-full bg-neutral-400 rounded"></div>
    </div>
  </div>
);

// --- Memoized Child Components (DesktopItem, MobileItem remain unchanged) ---
interface DesktopItemProps { item: Item; renderPrice: (priceCents: number) => string; replaceText: (text: string) => string; priority: boolean; }
const DesktopItem = memo(({ item, renderPrice, replaceText, priority }: DesktopItemProps) => {
  return (
    <Link href={`/product/${item.data.slug}`} passHref>
      <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
        <div className="overflow-hidden rounded-t-lg relative flex-grow" style={{ aspectRatio: '1 / 1' }}>
          <Image className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover" src={item.data.image_url} alt={replaceText(item.value)} fill unoptimized sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, (max-width: 1536px) 25vw, 20vw" priority={priority} loading={priority ? 'eager' : 'lazy'} />
        </div>
        <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
          <span className="truncate pr-2">{replaceText(item.value)}</span>
          <div className={`py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden ${item.data.lowest_price_cents === 0 ? 'bg-neutral-800 border border-neutral-700 text-neutral-400' : 'bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500'}`}>
            {item.data.lowest_price_cents === 0 ? (<span className="block">Unavailable</span>) : (<><span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">{renderPrice(item.data.lowest_price_cents)}</span><span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">View</span></>)}
          </div>
        </div>
      </div>
    </Link>
  );
});
DesktopItem.displayName = 'DesktopItem';

interface MobileItemProps { item: Item; renderPrice: (priceCents: number) => string; replaceText: (text: string) => string; priority: boolean; }
const MobileItem = memo(({ item, renderPrice, replaceText, priority }: MobileItemProps) => {
  return (
    <Link href={`/product/${item.data.slug}`} passHref>
      <div className="text-white bg-black border border-neutral-800 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neutral-600 h-full flex flex-col group">
        <div className="block w-full text-xs font-bold flex items-center p-2 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-700">
          <span className="block">{item.data.lowest_price_cents === 0 ? 'Unavailable' : renderPrice(item.data.lowest_price_cents)}</span>
        </div>
        <div className="overflow-hidden rounded-b-lg relative flex-grow" style={{ aspectRatio: '1 / 1' }}>
          <Image className="rounded-b-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover" src={item.data.image_url} alt={replaceText(item.value)} fill unoptimized sizes="50vw" priority={priority} loading={priority ? 'eager' : 'lazy'} />
        </div>
        <div className="w-full text-xs font-bold flex items-center p-3 border-t border-neutral-700 justify-center text-center relative group-hover:border-neutral-500 transition-colors duration-300">
          <span className="truncate">{replaceText(item.value)}</span>
        </div>
      </div>
    </Link>
  );
});
MobileItem.displayName = 'MobileItem';

interface CategoryCardProps {
  label: string;
  items: Item[]; // These are for the visual collage within the card
  replaceText: (text: string) => string;
  priority: boolean;
}
const CategoryCard = memo(({ label, items, replaceText, priority }: CategoryCardProps) => {
  const firstItem = items?.[0];
  const secondItem = items?.[1];
  const thirdItem = items?.[2];

  if (!firstItem) return null;

  // The CategoryCard itself links to the category page using the categoryUrl from the first item.
  const categoryUrl = firstItem?.categoryUrl || '#';

  return (
    <div className="text-black rounded tracking-tight relative bg-white border border-neutral-700 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-neutral-400 h-fit flex flex-col group">
      <Link href={categoryUrl} passHref>
        <div className="w-full flex justify-between items-center text-lg md:text-xl font-bold bg-white text-black p-4 border-b border-neutral-200 relative transition-colors duration-300 group-hover:bg-neutral-50">
          <span className="truncate pr-2">{replaceText(label)}</span>
          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 text-neutral-600 flex-shrink-0" />
        </div>
      </Link>
      <Link href={categoryUrl} passHref className="block flex-grow">
        <div className="relative overflow-hidden bg-black group-hover:bg-white transition-colors duration-300" style={{ aspectRatio: '1 / 1' }}>
          {firstItem && (
            <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start" style={{ zIndex: 1 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-105" style={{ width: '130%', height: '130%' }}>
                <Image className="object-contain w-full h-full" src={firstItem.data.image_url} alt={`${label} product 1`} fill unoptimized sizes="(max-width: 768px) 30vw, 15vw" priority={priority} loading={priority ? "eager" : "lazy"} />
              </div>
            </div>
          )}
          {secondItem && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-110" style={{ width: '75%', height: '75%' }}>
                <Image className="object-contain w-full h-full drop-shadow-md" src={secondItem.data.image_url} alt={`${label} product 2`} fill unoptimized sizes="(max-width: 768px) 40vw, 20vw" priority={priority} loading={priority ? "eager" : "lazy"} />
              </div>
            </div>
          )}
          {thirdItem && (
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end" style={{ zIndex: 1 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-105" style={{ width: '130%', height: '130%' }}>
                <Image className="object-contain w-full h-full" src={thirdItem.data.image_url} alt={`${label} product 3`} fill unoptimized sizes="(max-width: 768px) 30vw, 15vw" priority={priority} loading={priority ? "eager" : "lazy"} />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});
CategoryCard.displayName = 'CategoryCard';

// --- Main HomeComponent ---
const Home = () => {
  const [data, setData] = useState<{ [key: string]: Item[] }>(() => (isCacheValid(homeCache.timestamp) && homeCache.data ? homeCache.data : {}));
  // UPDATED categoryData state and its type
  const [categoryData, setCategoryData] = useState<{ [elKey: string]: ProcessedSanityCategory[] }>(() => (isCacheValid(homeCache.timestamp) && homeCache.categoryData ? homeCache.categoryData : {}));
  const [mntRate, setMntRate] = useState<number | null>(() => (isCacheValid(homeCache.timestamp) ? homeCache.mntRate : null));
  const [collections, setCollections] =useState<CollectionDoc[]>(() => (isCacheValid(homeCache.timestamp) && homeCache.collections ? homeCache.collections : []));
  const [sanityNameMap, setSanityNameMap] = useState<Map<string, string> | null>(() => (isCacheValid(homeCache.timestamp) && homeCache.sanityNameMap ? homeCache.sanityNameMap : null));
  
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const collectionsCached = isCacheValid(homeCache.timestamp) && homeCache.collections && homeCache.collections.length > 0;
    const dataCached = isCacheValid(homeCache.timestamp) && homeCache.data && Object.keys(homeCache.data).length > 0;
    // Also consider categoryData for initial loading state if it's critical path
    const categoryDataCached = isCacheValid(homeCache.timestamp) && homeCache.categoryData && Object.keys(homeCache.categoryData).length > 0;
    const sanityMapCached = isCacheValid(homeCache.timestamp) && homeCache.sanityNameMap !== null;
    return !(collectionsCached && dataCached && sanityMapCached && categoryDataCached);
  });

  const [error, setError] = useState<string | null>(null);
  const { setPageData } = useProductContext();
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const sectionRefs = useRef<SectionRefs>({});
  const [itemLimit, setItemLimit] = useState(12);

  useEffect(() => {
    const updateLimit = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1536) { setItemLimit(18); }
      else if (screenWidth >= 1280) { setItemLimit(15); }
      else if (screenWidth >= 1024) { setItemLimit(12); }
      else { setItemLimit(6); }
    };
    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  const replaceText = useCallback((text: string): string => {
    try { return String(text || '').replace(/GOAT/gi, 'SAINT').replace(/Canada/gi, 'MONGOLIA'); }
    catch (e) { console.error("Error replacing text:", text, e); return text || ''; }
  }, []);

  const renderPrice = (priceCents: number): string => {
    if (priceCents === 0) return 'Unavailable';
    if (mntRate === null) return '...';
    const price = (priceCents * mntRate) / 100;
    return `₮${Math.ceil(price).toLocaleString('en-US')}`;
  };

  useEffect(() => {
    let isMounted = true;
    const needToFetchCollections = !(isCacheValid(homeCache.timestamp) && homeCache.collections && homeCache.collections.length > 0);
    const needToFetchSanityNames = !(isCacheValid(homeCache.timestamp) && homeCache.sanityNameMap);

    const fetchInitialMeta = async () => {
      try {
        if (needToFetchCollections) {
          console.log("Fetching collections...");
          const response = await fetch("/api/payload/collections?sort=order");
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for collections`);
          const fetchedData = await response.json();
          const collectionsArray = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.docs || []);
          const cleanedCollections = collectionsArray.map((c: CollectionDoc) => ({ ...c, url: c.url?.trim() })).filter((c: CollectionDoc) => c.url);
          const sortedCollections = [...cleanedCollections].sort((a, b) => a.order - b.order);
          if (isMounted) {
            setCollections(sortedCollections);
            homeCache.collections = sortedCollections;
            homeCache.timestamp = Date.now();
          }
        } else {
          if (isMounted && collections.length === 0 && homeCache.collections) {
            setCollections(homeCache.collections);
          }
        }

        if (needToFetchSanityNames) {
          console.log("Fetching Sanity collection names...");
          const sanityData = await sanityClient.fetch<Array<{ name: string; url: string }>>('*[_type=="productCollection"]{name,url}');
          const newMap = new Map<string, string>();
          sanityData.forEach((sc: { name: string; url: string }) => {
            if (sc.url && sc.name) { newMap.set(sc.url.trim(), sc.name); }
          });
          if (isMounted) {
            setSanityNameMap(newMap);
            homeCache.sanityNameMap = newMap;
            homeCache.timestamp = Date.now();
          }
        } else {
          if (isMounted && !sanityNameMap && homeCache.sanityNameMap) {
            setSanityNameMap(homeCache.sanityNameMap);
          }
        }
      } catch (error) {
        console.error("Fetch error in initial meta (collections/Sanity):", error);
        if (isMounted) { setError((prevError) => prevError ? `${prevError}\nInitial meta error: ${error instanceof Error ? error.message : String(error)}` : `Initial meta error: ${error instanceof Error ? error.message : String(error)}`); }
      }
    };
    fetchInitialMeta();
    return () => { isMounted = false; };
  }, [collections.length, sanityNameMap]); // Added dependencies

  const fetchCurrencyData = useCallback(async (forceRefetch = false) => {
    if (!forceRefetch && isCacheValid(homeCache.timestamp) && homeCache.mntRate !== null) {
      if (mntRate !== homeCache.mntRate) setMntRate(homeCache.mntRate);
      return homeCache.mntRate;
    }
    console.log(forceRefetch ? "Forcing fetch MNT rate..." : "Fetching MNT rate...");
    try {
      const res = await fetch('https://hexarate.paikama.co/api/rates/latest/USD?target=MNT');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const currencyData = await res.json();
      if (currencyData.status_code === 200 && currencyData.data?.mid) {
        const rate = currencyData.data.mid;
        setMntRate(rate);
        homeCache.mntRate = rate;
        homeCache.timestamp = Date.now();
        return rate;
      } else { throw new Error('MNT rate not available or invalid format'); }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError((prevError) => prevError ? `${prevError}\nFailed to fetch currency: ${errorMessage}` : `Failed to fetch currency: ${errorMessage}`);
      const fallbackRate = 1;
      setMntRate(fallbackRate);
      console.error('Failed to fetch currency data, using fallback:', error);
      return fallbackRate;
    }
  }, [mntRate]);

  const fetchAllData = useCallback(async (currentCollections: CollectionDoc[], currentMntRate: number, currentSanityNameMap: Map<string, string> | null, forceRefetch = false) => {
    if (!forceRefetch && isCacheValid(homeCache.timestamp) && homeCache.data && Object.keys(homeCache.data).length > 0 && homeCache.categoryData && Object.keys(homeCache.categoryData).length > 0) {
      console.log("Using cached homepage data (products/categories).");
      if (data !== homeCache.data) setData(homeCache.data);
      if (categoryData !== homeCache.categoryData) setCategoryData(homeCache.categoryData);
      if (setPageData && homeCache.data) setPageData(homeCache.data);
      // Initialize refs for cached data
      const newSectionRefs: SectionRefs = {};
      Object.keys(homeCache.data).forEach((_, index) => {
          const sectionId = `section-${index}`;
          newSectionRefs[sectionId] = sectionRefs.current[sectionId] || React.createRef<HTMLDivElement>();
      });
      sectionRefs.current = newSectionRefs;
      setVisibleSections(Object.keys(homeCache.data).slice(0, 3).map((_, i) => `section-${i}`));
      setIsLoading(false);
      return;
    }
    console.log(forceRefetch ? "Forcing fetch all page data..." : "Fetching all page data...");
    setIsLoading(true);
    setError(null);

    if (currentCollections.length === 0 || currentMntRate === null || currentSanityNameMap === null) {
      console.warn("Attempted to fetchAllData without collections, mntRate, or sanityNameMap.");
      if(currentCollections.length === 0) setError(prev => prev ? `${prev}\nMissing collections` : "Missing collections");
      if(currentMntRate === null) setError(prev => prev ? `${prev}\nMissing currency rate` : "Missing currency rate");
      if(currentSanityNameMap === null) setError(prev => prev ? `${prev}\nMissing Sanity names` : "Missing Sanity names");
      setIsLoading(false);
      return;
    }

    try {
      // --- Fetch Product Collections (Main Content) ---
      const sortedCollections = [...currentCollections].sort((a, b) => a.order - b.order);
      const collectionPromises = sortedCollections.map(collection =>
        fetch(collection.url).then(res => {
          if (!res.ok) return Promise.reject(`Failed fetch ${collection.url} status: ${res.status}`);
          return res.json();
        }).catch(err => {
          console.warn(`Error fetching ${collection.url}:`, err);
          return null;
        })
      );
      const collectionResponses = await Promise.all(collectionPromises);
      const categorizedResults: { [key: string]: Item[] } = {};
      const tempSectionRefs: SectionRefs = {};

      collectionResponses.forEach((res: ApiCollectionResponse | null, index) => {
        if (!res?.response?.collection || !res.response.results) {
          console.warn(`No valid data for collection URL: ${sortedCollections[index]?.url}`);
          return;
        }
        const collectionInfo = res.response.collection;
        const originalCollectionDoc = sortedCollections[index];
        let categoryName = collectionInfo.display_name;
        if (categoryName && currentSanityNameMap) {  //herwee          if (!categoryName && currentSanityNameMap) { baiwal ajilna shuuu!!!!!
          const sanityMappedName = currentSanityNameMap.get(originalCollectionDoc.url.trim());
          if (sanityMappedName) categoryName = sanityMappedName;
        }
        const categoryTitle = categoryName || `Collection ${index + 1}`;
        const categoryUrl = collectionInfo.id ? `/browse/collection_id/${collectionInfo.id}` : '#';

        categorizedResults[categoryTitle] = res.response.results.map((item): Item => ({
          data: item.data,
          value: item.value,
          category: categoryTitle,
          categoryUrl: categoryUrl,
        }));
        const sectionId = `section-${index}`;
        if (!sectionRefs.current[sectionId]) { // Check existing refs before creating new
          tempSectionRefs[sectionId] = React.createRef<HTMLDivElement>();
        } else {
          tempSectionRefs[sectionId] = sectionRefs.current[sectionId];
        }
      });
      sectionRefs.current = {...sectionRefs.current, ...tempSectionRefs};


      // --- Fetch Category Preview Data from Sanity ---
      console.log("Fetching Sanity productCategoryUrls...");
      const sanityCategoryDocs = await sanityClient.fetch<SanityProductCategoryUrlDoc[]>(
        `*[_type == "productCategoryUrls"] | order(order asc) {
          docCategory, order, 
          el1{url, label}, el2{url, label}, 
          el3{url, label}, el4{url, label}
        }`
      );
      
      const tempNewCategoryData: { [elKey: string]: ProcessedSanityCategory[] } = {};

      const determineUrl = (apiRes: ApiCollectionResponse): string => {
          if (apiRes.response?.collection?.id) return `/browse/collection_id/${apiRes.response.collection.id}`;
          if (apiRes.response?.request?.term) {
              const groupValue = apiRes.response.facets?.group_id?.values?.[0]?.value;
              return groupValue ? `/browse/group_id/${groupValue}?q=${apiRes.response.request.term}` : `/search/${apiRes.response.request.term}`;
          }
          if (apiRes.response?.facets?.group_id?.values?.[0]?.value) return `/browse/group_id/${apiRes.response.facets.group_id.values[0].value}`;
          return '#';
      };

      for (const [docIndex, sanityDoc] of sanityCategoryDocs.entries()) {
        const elKey = `el${docIndex + 1}`; // Key for this set of categories, e.g., "el1", "el2"
        tempNewCategoryData[elKey] = [];
        const categoryElements = [sanityDoc.el1, sanityDoc.el2, sanityDoc.el3, sanityDoc.el4].filter(Boolean);

        for (const [catElIndex, catEl] of categoryElements.entries()) {
          if (catEl && catEl.url && catEl.label) {
            const sanityProvidedLabel = catEl.label;
            const productDataUrl = catEl.url;

            try {
              const apiRes: ApiCollectionResponse | null = await fetch(productDataUrl)
                .then(res => {
                  if (!res.ok) return Promise.reject(`Failed fetch ${productDataUrl} for category preview`);
                  return res.json();
                })
                .catch(err => {
                  console.warn(`Error fetching products for category preview ${sanityProvidedLabel} from ${productDataUrl}:`, err);
                  return null;
                });

              if (!apiRes?.response?.results?.length) {
                console.warn(`No product results for category ${sanityProvidedLabel} from ${productDataUrl}`);
                continue;
              }
              
              const determinedNavUrl = determineUrl(apiRes);
              const productsForCard: Item[] = apiRes.response.results.slice(0, 3).map((product): Item => ({
                data: product.data,
                value: product.value || sanityProvidedLabel, // Product name
                category: sanityProvidedLabel,       // Category label from Sanity
                categoryUrl: determinedNavUrl,       // Navigation URL for the CategoryCard
              }));

              if (productsForCard.length > 0) {
                tempNewCategoryData[elKey].push({
                  id: `${elKey}-${sanityProvidedLabel.replace(/\s+/g, '-')}-${catElIndex}`,
                  label: sanityProvidedLabel,
                  items: productsForCard,
                });
              }
            } catch (e) {
              console.warn(`Error processing Sanity category element ${sanityProvidedLabel} from ${productDataUrl}:`, e);
            }
          }
        }
      }
      
      setData(categorizedResults);
      setCategoryData(tempNewCategoryData);
      if (setPageData) setPageData(categorizedResults); // Assuming page data is still the main product collections

      homeCache.data = categorizedResults;
      homeCache.categoryData = tempNewCategoryData; // Cache new category data structure
      homeCache.timestamp = Date.now();
      
      const finalSectionRefs: SectionRefs = { ...sectionRefs.current };
      Object.keys(categorizedResults).forEach((_, index) => {
          const sectionId = `section-${index}`;
          if (!finalSectionRefs[sectionId]) {
              finalSectionRefs[sectionId] = React.createRef<HTMLDivElement>();
          }
      });
      sectionRefs.current = finalSectionRefs;

      setVisibleSections(Object.keys(categorizedResults).slice(0, 3).map((_, i) => `section-${i}`));
      console.log("All page data fetched and cached.");

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error during data fetching process:', err);
      setError(`Error fetching page data: ${errorMessage}.`);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPageData /*, other minimal dependencies if needed */]);


  useEffect(() => {
    const collectionsAvailable = collections.length > 0;
    const rateAvailable = mntRate !== null;
    const sanityMapAvailable = sanityNameMap !== null;

    if (collectionsAvailable && !rateAvailable) {
      fetchCurrencyData();
    }
    
    if (collectionsAvailable && rateAvailable && sanityMapAvailable) {
      const dataIsEmpty = Object.keys(data).length === 0;
      const categoryDataIsEmpty = Object.keys(categoryData).length === 0;

      if (dataIsEmpty || categoryDataIsEmpty) { // Fetch if either main data or category data is missing
        fetchAllData(collections, mntRate, sanityNameMap);
      } else if (!isCacheValid(homeCache.timestamp)) {
        fetchAllData(collections, mntRate, sanityNameMap, true); // Force refetch if cache expired
      }
    }
  }, [collections, mntRate, sanityNameMap, fetchCurrencyData, fetchAllData, data, categoryData]);


  useEffect(() => {
    const currentRefs = sectionRefs.current;
    if (Object.keys(currentRefs).length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-section-id');
        if (id && entry.isIntersecting) {
          setVisibleSections((prev) => (prev.includes(id) ? prev : [...prev, id]));
        }
      });
    }, { threshold: 0.1, rootMargin: '200px 0px 200px 0px' });
    Object.values(currentRefs).forEach((refObject) => {
      if (refObject.current) observer.observe(refObject.current);
    });
    return () => {
      Object.values(currentRefs).forEach((refObject) => {
        if (refObject?.current) {
          try { observer.unobserve(refObject.current); }
          catch (e) { console.warn("Error unobserving ref:", e); }
        }
      });
      observer.disconnect();
    };
  }, [data]); // Re-run if data driving the refs changes

  const handleRetry = useCallback(async (forceRefetch = true) => {
    console.log(`Handling retry (forceRefetch: ${forceRefetch})`);
    setError(null);
    if (forceRefetch) {
        console.log("Clearing cache and state for hard refresh.");
        homeCache = { data: null, categoryData: null, mntRate: null, collections: null, sanityNameMap: null, timestamp: null };
        setCollections([]);
        setMntRate(null);
        setSanityNameMap(null);
        setData({});
        setCategoryData({}); // Reset category data
        setVisibleSections([]);
        setIsLoading(true);
        // Re-fetch initial meta data, other effects will trigger subsequent fetches
        try {
            console.log("Re-fetching collections for retry...");
            const collResponse = await fetch("/api/payload/collections?sort=order");
            if (!collResponse.ok) throw new Error(`HTTP error! status: ${collResponse.status} for collections`);
            const fetchedCollData = await collResponse.json();
            const collsArray = Array.isArray(fetchedCollData) ? fetchedCollData : (fetchedCollData?.docs || []);
            const cleanedColls = collsArray.map((c: CollectionDoc) => ({ ...c, url: c.url?.trim() })).filter((c: CollectionDoc) => c.url);
            const sortedColls = [...cleanedColls].sort((a, b) => a.order - b.order);
            setCollections(sortedColls); // This will trigger Effect1 (dependency) and Effect4
            homeCache.collections = sortedColls;

            console.log("Re-fetching Sanity names for retry...");
            const sanityData = await sanityClient.fetch<Array<{ name: string; url: string }>>('*[_type=="productCollection"]{name,url}');
            const newMap = new Map<string, string>();
            sanityData.forEach((sc: { name: string; url: string }) => { if (sc.url && sc.name) newMap.set(sc.url.trim(), sc.name); });
            setSanityNameMap(newMap); // This will trigger Effect1 (dependency) and Effect4
            homeCache.sanityNameMap = newMap;
            homeCache.timestamp = Date.now(); // Update timestamp after successful meta fetches
        } catch (retryError) {
            console.error("Error during hard retry:", retryError);
            setError(`Failed to reload initial data: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
            setIsLoading(false);
        }
    } else { // Soft retry
        setIsLoading(true);
        if (collections.length === 0 || sanityNameMap === null) {
            // If core meta is missing, a soft retry might not recover well without re-triggering initial meta fetch.
            // For simplicity, encouraging hard refresh or assuming effects handle it.
             console.warn("Soft retry: collections or sanity map missing. Consider hard refresh if issues persist.");
             // Attempt to re-trigger the chain. Effect 4 should run if collections/mntRate/sanityNameMap get populated.
             // If they are empty, it might not call fetchAllData due to guards.
             // This part might need more sophisticated logic based on what specifically failed.
             // For now, if mntRate is missing, try fetching it. Then let effects take over.
             if (mntRate === null && collections.length > 0) {
                fetchCurrencyData(false);
             } else if (collections.length > 0 && mntRate !== null && sanityNameMap !== null) {
                fetchAllData(collections, mntRate, sanityNameMap, false);
             } else {
                setIsLoading(false);
                setError(prev => prev ? `${prev}\nCannot perform soft retry, critical data missing.` : "Cannot perform soft retry, critical data missing.");
             }
        } else if (mntRate === null) {
            fetchCurrencyData(false);
        } else {
            fetchAllData(collections, mntRate, sanityNameMap, false);
        }
    }
  }, [collections, sanityNameMap, mntRate, fetchCurrencyData, fetchAllData]);


  // --- MODIFIED renderCategoryItems ---
  const renderCategoryItems = useCallback((elKey: string, sectionIndex: number) => {
    // elKey will be like "el1", "el2", etc. corresponding to the order of Sanity docs
    const categoriesForThisSection = categoryData[elKey];

    if (!categoriesForThisSection || categoriesForThisSection.length === 0) {
      // console.log(`No category items to render for elKey: ${elKey}`);
      return null;
    }
    // console.log(`Rendering category items for elKey: ${elKey}`, categoriesForThisSection);

    return (
      <div className="mt-16 md:mt-24">
        {/* Desktop Grid for Categories */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
          {categoriesForThisSection.map((catProfile, idx) => (
            <CategoryCard
              key={catProfile.id}
              label={catProfile.label}
              items={catProfile.items}
              replaceText={replaceText}
              priority={sectionIndex < 1 && idx < 4} // Prioritize first few category cards on desktop
            />
          ))}
        </div>
        {/* Mobile: 2x2 Grid for Categories */}
        <div className="block lg:hidden px-2 md:px-0"> {/* Added some horizontal padding for mobile */}
          <div className="grid grid-cols-2 gap-3"> {/* sm:gap-4 if more space desired */}
            {categoriesForThisSection.slice(0, 4).map((catProfile, idx) => ( // Ensure only up to 4 are shown
              <div key={catProfile.id} className="w-full h-full">
                <CategoryCard
                  label={catProfile.label}
                  items={catProfile.items}
                  replaceText={replaceText}
                  priority={sectionIndex < 1 && idx < 2} // Prioritize first 2 cards (first row) on mobile
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [categoryData, replaceText]);


  if (isLoading && Object.keys(data).length === 0 && Object.keys(categoryData).length === 0) {
    const skeletonSectionCount = (homeCache.collections && homeCache.collections.length > 0) ? homeCache.collections.length : 3;
    return (
      <div className="p-0 md:p-0">
        {[...Array(skeletonSectionCount)].map((_, index) => (
          <div key={`skeleton-section-${index}`} className="mb-12 md:mb-16">
            <div className="flex justify-between items-center mb-6 md:mb-8 px-4 md:px-0">
              <div className="h-7 md:h-8 w-1/2 md:w-1/3 bg-neutral-700 rounded-lg animate-pulse"></div>
              <div className="h-5 md:h-6 w-1/4 md:w-1/6 bg-neutral-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 px-4 md:px-0">
              {[...Array(itemLimit > 6 ? Math.floor(itemLimit / 3) : 6)].map((_, i) => <SkeletonCard key={`skeleton-prod-card-${index}-${i}`} />)}
            </div>
            <div className="block lg:hidden px-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {[...Array(4)].map((_, i) => (<div key={`skeleton-mobile-prod-card-${index}-${i}`} className="w-full"><SkeletonCard /></div>))}
              </div>
            </div>
            {index < 2 && ( // Assuming category previews for the first 2 sections
              <div className="mt-16 md:mt-24 px-4 md:px-0">
                <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (<SkeletonCategoryCard key={`skeleton-cat-desktop-${index}-${i}`} />))}
                </div>
                {/* Mobile Skeleton for 2x2 Category Grid */}
                <div className="block lg:hidden px-2 md:px-0">
                   <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={`skeleton-cat-mobile-${index}-${i}`} className="w-full"><SkeletonCategoryCard /></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-400 bg-neutral-900 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4 text-red-300">Oops! Something went wrong.</h2>
        <p className="text-neutral-400 mb-2">We encountered an error while loading the page content.</p>
        <pre className="whitespace-pre-wrap text-left bg-neutral-800 p-4 rounded-md text-sm max-w-2xl overflow-auto mb-6">{error}</pre>
        <div className="mt-4">
          <button onClick={() => handleRetry(false)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg mr-3 transition-colors duration-150">Try Again</button>
          <button onClick={() => handleRetry(true)} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150">Hard Refresh</button>
        </div>
        <p className="text-neutral-500 text-xs mt-8">If the problem persists, please contact support.</p>
      </div>
    );
  }

  if (!isLoading && !error && Object.keys(data).length === 0) {
    return (
      <div className="p-4 text-center text-neutral-400 bg-neutral-900 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4 text-white">No Content Available</h2>
        <p className="text-neutral-500 mb-6">We couldn&lsquo;t find any products or collections to display at the moment.</p>
        <button onClick={() => handleRetry(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150">Refresh Page</button>
      </div>
    );
  }


  return (
    <div className="p-0 md:p-0">
      {Object.entries(data).map(([title, items], index) => {
  console.log(replaceText(title))

        const sectionId = `section-${index}`;
        if (!sectionRefs.current[sectionId]) {
          sectionRefs.current[sectionId] = React.createRef<HTMLDivElement>();
        }
        // elKey now corresponds to the order of Sanity docs (1-indexed)
        const elKey = `el${index + 1}`;
        const shouldRenderContent = visibleSections.includes(sectionId);

        return (
          <section
            key={sectionId}
            className={`mb-12 md:mb-16 transition-opacity duration-700 ease-in-out ${shouldRenderContent ? 'opacity-100' : 'opacity-0'}`}
            ref={sectionRefs.current[sectionId]}
            data-section-id={sectionId}
            style={{ minHeight: shouldRenderContent ? 'auto' : '400px' }}
            aria-label={replaceText(title)}
          >
            {shouldRenderContent ? (
              <>
                <header className="flex justify-between items-center mb-6 md:mb-8 px-4 md:px-0">
                  <h2 className="font-extrabold text-white text-xl md:text-3xl relative truncate pr-4">{replaceText(title)}</h2>
                  {items.length > 0 && items[0].categoryUrl && items[0].categoryUrl !== '#' && (
                    <Link className="text-neutral-300 hover:text-white font-semibold text-xs md:text-sm underline whitespace-nowrap flex-shrink-0" href={items[0].categoryUrl.replace('/browse/collection_id', '/collections')} aria-label={`View all ${replaceText(title)}`}>
                      View All
                    </Link>
                  )}
                </header>
                {/* Mobile: ProductGrid */}
                <div className="block lg:hidden mb-8 px-3">
                  {items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      {items.map((item, idx) => ( <MobileItem key={`${item.data.id}-mobile-${idx}`} item={item} renderPrice={renderPrice} replaceText={replaceText} priority={idx < 4} /> ))}
                    </div>
                  ) : (<p className="text-neutral-500 text-center py-4 col-span-full">No items found.</p>)}
                </div>
                {/* Desktop: ProductGrid */}
                <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 px-2 md:px-0">
                  {items.length > 0 ? (
                    items.slice(0, itemLimit).map((item, idx) => ( <DesktopItem key={`${item.data.id}-desktop-${idx}`} item={item} renderPrice={renderPrice} replaceText={replaceText} priority={idx < (itemLimit / 3)} /> ))
                  ) : (<p className="text-neutral-500 col-span-full text-center py-4">No items found.</p>)}
                </div>
                
                {/* Render Associated Category Previews from Sanity */}
                {categoryData[elKey] && Object.keys(categoryData[elKey]!).length > 0 && (
                  renderCategoryItems(elKey, index)
                )}
              </>
            ) : null}
          </section>
        );
      })}
    </div>
  );
};

export default memo(Home);