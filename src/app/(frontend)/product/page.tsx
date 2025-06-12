'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useProductContext } from '../../context/ProductContext'; // Assuming this context exists
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import { client as sanityClient } from '../../../../lib/sanity'; // Adjust path as needed

//--- Interface Definitions ---

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
    category: string; // Collection name
    categoryUrl: string; // Navigation URL for the category
}

interface CollectionDoc {
    name: string;
    url: string;
    order: number;
}

// Added type for the raw collection object from the API
interface ApiCollectionDoc {
  url?: string;
  name?: string;
  order?: number;
  // Add any other properties that might exist on the raw doc
}


// Type for an individual item in the API response results array
type ApiResultItem = {
    data: ItemData;
    value: string;
};

interface ApiCollectionResponse {
    response?: {
        collection?: {
            display_name?: string;
            id?: string;
        };
        results?: ApiResultItem[];
        facets?: {
            group_id?: {
                values?: Array<{ value: string }>;
            };
        };
        request?: {
            term?: string;
        };
    };
}

interface ProcessedSanityCategory {
    id: string;
    label: string;
    items: Item[];
}

interface SanityProductCategoryUrlDoc {
    docCategory?: string;
    order: number;
    el1?: { url: string; label: string };
    el2?: { url: string; label: string };
    el3?: { url: string; label: string };
    el4?: { url: string; label: string };
}

//--- In-Memory Cache ---

interface HomeCache {
    collections: CollectionDoc[] | null;
    sanityCategoryDocs: SanityProductCategoryUrlDoc[] | null;
    mntRate: number | null;
    timestamp: number | null;
}

let homeCache: HomeCache = {
    collections: null,
    sanityCategoryDocs: null,
    mntRate: null,
    timestamp: null,
};

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (cacheTimestamp: number | null): boolean => {
    if (!cacheTimestamp) return false;
    return Date.now() - cacheTimestamp < CACHE_DURATION_MS;
};

//--- Skeleton Loading Components (Unchanged) ---

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

//--- Memoized Child Components (Unchanged) ---

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
                        {item.data.lowest_price_cents === 0 ? (
                            <span className="block">Unavailable</span>
                        ) : (
                            <>
                                <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">{renderPrice(item.data.lowest_price_cents)}</span>
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">View</span>
                            </>
                        )}
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

interface CategoryCardProps { label: string; items: Item[]; replaceText: (text: string) => string; priority: boolean; }
const CategoryCard = memo(({ label, items, replaceText, priority }: CategoryCardProps) => {
    const firstItem = items?.[0];
    const secondItem = items?.[1];
    const thirdItem = items?.[2];

    if (!firstItem) return null;

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

//--- Main Home Component (Fixed and Optimized) ---
const Home = () => {
    // State for data that gets loaded progressively as user scrolls
    const [data, setData] = useState<{ [title: string]: Item[] }>({});
    const [categoryData, setCategoryData] = useState<{ [elKey: string]: ProcessedSanityCategory[] }>({});

    // State for initial metadata required to build the page layout.
    const [collections, setCollections] = useState<CollectionDoc[]>([]);
    const [sanityCategoryDocs, setSanityCategoryDocs] = useState<SanityProductCategoryUrlDoc[]>([]);
    const [mntRate, setMntRate] = useState<number | null>(null);

    // Loading and error states
    const [isMetaLoading, setIsMetaLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Refs and context
    const { setPageData } = useProductContext();
    const sectionRefs = useRef<SectionRefs>({});
    const fetchedSections = useRef(new Set<string>());

    // Responsive item limit for desktop view
    const [itemLimit, setItemLimit] = useState(12);

    useEffect(() => {
        const updateLimit = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1536) { setItemLimit(18); }
            else if (screenWidth >= 1280) { setItemLimit(15); }
            else if (screenWidth >= 1024) { setItemLimit(12); }
            else { setItemLimit(8); } // Show 8 on mobile (4 rows)
        };
        updateLimit();
        window.addEventListener('resize', updateLimit);
        return () => window.removeEventListener('resize', updateLimit);
    }, []);

    // Utility functions
    const replaceText = useCallback((text: string): string => {
        try {
            return String(text || '').replace(/GOAT/gi, 'SAINT').replace(/Canada/gi, 'MONGOLIA');
        } catch (e) {
            console.error("Error replacing text:", text, e);
            return text || '';
        }
    }, []);

    const renderPrice = (priceCents: number): string => {
        if (priceCents === 0) return 'Unavailable';
        if (mntRate === null) return '...';
        const price = (priceCents * mntRate) / 100;
        return `₮${Math.ceil(price).toLocaleString('en-US')}`;
    };

    //--- OPTIMIZED DATA FETCHING STRATEGY ---

    // STEP 1: Fetch all essential metadata in parallel on initial load.
    useEffect(() => {
        const fetchMetadata = async () => {
            setIsMetaLoading(true);
            setError(null);
            fetchedSections.current.clear();

            if (isCacheValid(homeCache.timestamp) && homeCache.collections && homeCache.mntRate && homeCache.sanityCategoryDocs) {
                console.log("Using cached metadata for instant layout.");
                setCollections(homeCache.collections);
                setMntRate(homeCache.mntRate);
                setSanityCategoryDocs(homeCache.sanityCategoryDocs);
                setIsMetaLoading(false);
                return;
            }

            console.log("Fetching all essential metadata in parallel...");
            try {
                const [collectionsRes, sanityDocsRes, currencyRes] = await Promise.all([
                    fetch("/api/payload/collections?sort=order").then(res => res.ok ? res.json() : Promise.reject(`Collections fetch failed: ${res.status}`)),
                    sanityClient.fetch<SanityProductCategoryUrlDoc[]>(`*[_type == "productCategoryUrls"] | order(order asc) {docCategory, order, el1{url, label}, el2{url, label}, el3{url, label}, el4{url, label}}`),
                    fetch('https://hexarate.paikama.co/api/rates/latest/USD?target=MNT').then(res => res.ok ? res.json() : Promise.reject(`Currency fetch failed: ${res.status}`))
                ]);

                const collectionsArray = Array.isArray(collectionsRes) ? collectionsRes : (collectionsRes?.docs || []);
                // FIX: Use the specific ApiCollectionDoc type here instead of any.
               // Replace lines 309-312 with this corrected version:

const sortedCollections = collectionsArray
.map((c: ApiCollectionDoc) => ({ url: c.url?.trim(), name: c.name?.trim(), order: c.order }))
.filter((c: { url?: string; name?: string; order?: number }): c is CollectionDoc => 
    !!c.url && !!c.name && typeof c.order === 'number'
)
.sort((a: CollectionDoc, b: CollectionDoc) => a.order - b.order);

                const rate = currencyRes.data?.mid;
                if (!rate) throw new Error('MNT currency rate not available.');

                setCollections(sortedCollections);
                setSanityCategoryDocs(sanityDocsRes);
                setMntRate(rate);

                homeCache = { collections: sortedCollections, sanityCategoryDocs: sanityDocsRes, mntRate: rate, timestamp: Date.now() };
                console.log("Metadata fetched successfully.");

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error("Critical error fetching metadata:", errorMessage);
                setError(`Failed to load page. ${errorMessage}`);
            } finally {
                setIsMetaLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    const determineUrl = (apiRes: ApiCollectionResponse): string => {
        if (apiRes.response?.collection?.id) return `/browse/collection_id/${apiRes.response.collection.id}`;
        if (apiRes.response?.request?.term) {
            const groupValue = apiRes.response.facets?.group_id?.values?.[0]?.value;
            return groupValue ? `/browse/group_id/${groupValue}?q=${apiRes.response.request.term}` : `/search/${apiRes.response.request.term}`;
        }
        if (apiRes.response?.facets?.group_id?.values?.[0]?.value) return `/browse/group_id/${apiRes.response.facets.group_id.values[0].value}`;
        return '#';
    };

    const fetchCategoryPreviewsForIndex = useCallback(async (index: number): Promise<ProcessedSanityCategory[] | null> => {
        const sanityDoc = sanityCategoryDocs[index];
        if (!sanityDoc) return null;

        const categoryElements = [sanityDoc.el1, sanityDoc.el2, sanityDoc.el3, sanityDoc.el4].filter(Boolean);
        if (categoryElements.length === 0) return null;

        const promises = categoryElements.map(async (catEl) => {
            if (!catEl || !catEl.url || !catEl.label) return null;
            try {
                const apiRes: ApiCollectionResponse = await fetch(catEl.url).then(res => res.json());
                if (!apiRes?.response?.results?.length) return null;
                const determinedNavUrl = determineUrl(apiRes);

                // FIX: Type the 'product' parameter correctly.
                const productsForCard: Item[] = apiRes.response.results
                    .filter((product: ApiResultItem) => product?.data?.image_url)
                    .slice(0, 3)
                    .map((product: ApiResultItem): Item => ({
                        data: product.data,
                        value: product.value || catEl.label,
                        category: catEl.label,
                        categoryUrl: determinedNavUrl,
                    }));

                if (productsForCard.length > 0) {
                    return {
                        id: `${catEl.label.replace(/\s+/g, '-')}-${index}`,
                        label: catEl.label,
                        items: productsForCard,
                    };
                }
                return null;
            } catch (e) {
                console.warn(`Error processing preview for ${catEl.label}:`, e);
                return null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter((r): r is ProcessedSanityCategory => r !== null);
    }, [sanityCategoryDocs]);

    // STEP 2: Fetch data for a specific section ONLY when it becomes visible.
    const fetchDataForSection = useCallback(async (collection: CollectionDoc, index: number) => {
        const sectionId = `${collection.name}-${index}`;
        if (fetchedSections.current.has(sectionId) || !collection.url) {
            return;
        }

        console.log(`INTERSECTION: Fetching data for section: "${sectionId}"`);
        fetchedSections.current.add(sectionId);

        try {
            const [productRes, categoryPreviews] = await Promise.all([
                fetch(collection.url).then(res => res.json()),
                fetchCategoryPreviewsForIndex(index)
            ]);

            if (productRes?.response?.results) {
                const categoryUrl = determineUrl(productRes);
                // FIX: Type the 'item' parameter correctly.
                const items: Item[] = productRes.response.results.map((item: ApiResultItem): Item => ({
                    data: item.data,
                    value: item.value,
                    category: collection.name,
                    categoryUrl: categoryUrl,
                }));
                setData(prevData => ({ ...prevData, [sectionId]: items }));
                if (index === 0 && setPageData) {
                    const pageDataObject = { [sectionId]: items };
                    setPageData(pageDataObject);
                }
            }

            if (categoryPreviews) {
                const elKey = `el${index + 1}`;
                setCategoryData(prev => ({ ...prev, [elKey]: categoryPreviews }));
            }
        } catch (error) {
            console.error(`Failed to fetch data for section "${sectionId}":`, error);
        }
    }, [fetchCategoryPreviewsForIndex, setPageData]);

    // STEP 3: Setup Intersection Observer to trigger the data fetch on scroll.
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionIndex = Number(entry.target.getAttribute('data-section-index'));
                    const collection = collections[sectionIndex];
                    if (collection) {
                        fetchDataForSection(collection, sectionIndex);
                    }
                }
            });
        }, { threshold: 0.05, rootMargin: '200px 0px 200px 0px' });

        Object.values(sectionRefs.current).forEach((refObject) => {
            if (refObject.current) observer.observe(refObject.current);
        });

        return () => observer.disconnect();
    }, [collections, fetchDataForSection]);


    //--- RENDER LOGIC ---

    const handleRetry = () => {
        console.log("Performing hard refresh...");
        homeCache = { collections: null, sanityCategoryDocs: null, mntRate: null, timestamp: null };
        setCollections([]);
        setData({});
        setCategoryData({});
    };

    // RENDER STATE 1: Initial loading skeleton while fetching metadata.
    if (isMetaLoading) {
        const skeletonSectionCount = 3;
        return (
            <div className="p-0 md:p-0">
                {[...Array(skeletonSectionCount)].map((_, index) => (
                    <div key={`meta-skeleton-section-${index}`} className="mb-12 md:mb-16">
                        <div className="flex justify-between items-center mb-6 md:mb-8 px-4 md:px-0">
                            <div className="h-7 md:h-8 w-1/2 md:w-1/3 bg-neutral-700 rounded-lg animate-pulse"></div>
                            <div className="h-5 md:h-6 w-1/4 md:w-1/6 bg-neutral-700 rounded-lg animate-pulse"></div>
                        </div>
                        {/* Skeletons now respect the responsive itemLimit */}
                        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 px-4 md:px-0">
                            {[...Array(itemLimit)].map((_, i) => <SkeletonCard key={`meta-skel-prod-desk-${index}-${i}`} />)}
                        </div>
                        <div className="block lg:hidden px-3">
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                {[...Array(8)].map((_, i) => <div key={`meta-skel-prod-mob-${index}-${i}`} className="w-full"><SkeletonCard /></div>)}
                            </div>
                        </div>
                        {index < 2 && (
                            <div className="mt-16 md:mt-24 px-4 md:px-0">
                                <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => <SkeletonCategoryCard key={`meta-skel-cat-desk-${index}-${i}`} />)}
                                </div>
                                <div className="block lg:hidden px-2 md:px-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[...Array(4)].map((_, i) => <div key={`meta-skel-cat-mob-${index}-${i}`} className="w-full"><SkeletonCategoryCard /></div>)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // RENDER STATE 2: Critical error during metadata fetch.
    if (error) {
        return (
            <div className="p-4 text-center text-red-400 bg-neutral-900 min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold mb-4 text-red-300">Oops! Something went wrong.</h2>
                <p className="text-neutral-400 mb-2">We encountered an error while loading the page.</p>
                <pre className="whitespace-pre-wrap text-left bg-neutral-800 p-4 rounded-md text-sm max-w-2xl overflow-auto mb-6">{error}</pre>
                <button onClick={handleRetry} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150">Hard Refresh</button>
            </div>
        );
    }

    // RENDER STATE 3: Metadata fetched, but no collections were found.
    if (collections.length === 0) {
        return (
            <div className="p-4 text-center text-neutral-400 bg-neutral-900 min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold mb-4 text-white">No Content Available</h2>
                <p className="text-neutral-500 mb-6">We couldn&lsquo;t find any product collections to display.</p>
                <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150">Refresh Page</button>
            </div>
        );
    }

    // RENDER STATE 4: Main render.
    return (
        <div className="p-0 md:p-0">
            {collections.map((collection, index) => {
                const sectionId = `${collection.name}-${index}`;
                const title = collection.name;
                const items = data[sectionId];
                const elKey = `el${index + 1}`;
                const categoryItems = categoryData[elKey];

                if (!sectionRefs.current[sectionId]) {
                    sectionRefs.current[sectionId] = React.createRef<HTMLDivElement>();
                }

                return (
                    <section
                        key={sectionId} // Use unique key
                        ref={sectionRefs.current[sectionId]}
                        data-section-index={index}
                        className="mb-12 md:mb-16"
                        style={{ minHeight: '400px' }}
                        aria-label={replaceText(title)}
                    >
                        <header className="flex justify-between items-center mb-6 md:mb-8 px-4 md:px-0">
                            <h2 className="font-extrabold text-white text-xl md:text-3xl relative truncate pr-4">{replaceText(title)}</h2>
                            {items && items.length > 0 && items[0].categoryUrl !== '#' && (
                                <Link className="text-neutral-300 hover:text-white font-semibold text-xs md:text-sm underline whitespace-nowrap flex-shrink-0" href={items[0].categoryUrl.replace('/browse/collection_id', '/collections')} aria-label={`View all ${replaceText(title)}`}>
                                    View All
                                </Link>
                            )}
                        </header>

                        {/* Renders products OR skeletons if products haven't been fetched yet */}
                        <div className="block lg:hidden mb-8 px-3">
                            {items ? (
                                items.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        {items.filter(item => item?.data?.image_url) // Filter items with no image.
                                            .map((item, idx) => <MobileItem key={`${item.data.id}-mobile-${idx}`} item={item} renderPrice={renderPrice} replaceText={replaceText} priority={idx < 4} />)}
                                    </div>
                                ) : <p className="text-neutral-500 text-center py-4 col-span-full">No items found in this collection.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    {[...Array(8)].map((_, i) => <div key={`placeholder-mob-${index}-${i}`} className="w-full"><SkeletonCard /></div>)}
                                </div>
                            )}
                        </div>
                        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 px-2 md:px-0">
                            {items ? (
                                items.length > 0 ? (
                                    items.filter(item => item?.data?.image_url) // Filter items with no image.
                                        .slice(0, itemLimit)
                                        .map((item, idx) => <DesktopItem key={`${item.data.id}-desktop-${idx}`} item={item} renderPrice={renderPrice} replaceText={replaceText} priority={idx < 6} />)
                                ) : <p className="text-neutral-500 col-span-full text-center py-4">No items found in this collection.</p>
                            ) : (
                                // Skeleton count now matches itemLimit
                                [...Array(itemLimit)].map((_, i) => <SkeletonCard key={`placeholder-desk-${index}-${i}`} />)
                            )}
                        </div>

                        {/* Renders category previews OR skeletons */}
                        {categoryItems ? (
                            categoryItems.length > 0 && (
                                <div className="mt-16 md:mt-24">
                                    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
                                        {categoryItems.map((catProfile, idx) => <CategoryCard key={catProfile.id} label={catProfile.label} items={catProfile.items} replaceText={replaceText} priority={index < 1 && idx < 4} />)}
                                    </div>
                                    <div className="block lg:hidden px-2 md:px-0">
                                        <div className="grid grid-cols-2 gap-3">
                                            {categoryItems.slice(0, 4).map((catProfile, idx) => <div key={catProfile.id} className="w-full h-full"><CategoryCard label={catProfile.label} items={catProfile.items} replaceText={replaceText} priority={index < 1 && idx < 2} /></div>)}
                                        </div>
                                    </div>
                                </div>
                            )) : fetchedSections.current.has(sectionId) ? null : (index < 2 && (
                                <div className="mt-16 md:mt-24 px-4 md:px-0">
                                    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => <SkeletonCategoryCard key={`placeholder-cat-desk-${index}-${i}`} />)}
                                    </div>
                                    <div className="block lg:hidden px-2 md:px-0">
                                        <div className="grid grid-cols-2 gap-3">
                                            {[...Array(4)].map((_, i) => <div key={`placeholder-cat-mob-${index}-${i}`} className="w-full"><SkeletonCategoryCard /></div>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </section>
                );
            })}
        </div>
    );
};

export default memo(Home);