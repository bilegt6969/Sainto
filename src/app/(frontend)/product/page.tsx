'use client';
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useProductContext } from '../../context/ProductContext';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

// --- Interface Definitions ---
type SectionRefs = Record<string, React.RefObject<HTMLDivElement | null>>;
interface ItemData {
  id: string;
  slug: string;
  pictureUrl: string;
  title: string;
  category?: string;
  localizedRetailPriceCents?: {
    amountCents: number;
    currency: string;
  };
  variantsList?: Array<{
    localizedLowestPriceCents?: {
      amountCents: number;
      currency: string;
    };
  }>;
  inStock: boolean;
}
interface ProductListItem extends ItemData {
  collectionName: string;
}
interface Item {
  data: ItemData;
  value?: string;
  category: string;
  categoryUrl: string;
  collection: string;
}
interface CategoryImage {
  url: string;
  alt: string;
}
interface CollectionDoc {
  url: string;
  name: string;
  order: number;
  products?: ProductListItem[];
}
interface ProcessedSanityCategory {
  id: string;
  label: string;
  categoryUrl: string;
  images: CategoryImage[];
}
interface SanityProductCategoryUrlDoc {
  category?: string;
  order: number;
  el1?: { url1: string; url2?: string; url3?: string; label: string };
  el2?: { url1: string; url2?: string; url3?: string; label: string };
  el3?: { url1: string; url2?: string; url3?: string; label: string };
  el4?: { url1: string; url2?: string; url3?: string; label: string };
}
interface ProductScrollerProps {
    items: Item[];
    ItemComponent: React.ElementType;
    renderPrice: (priceCents: number) => string;
    replaceText: (text: string) => string;
    itemLimit?: number;
    itemBaseClassName: string;
    priorityStartIndex?: number;
}

// --- In-Memory Cache ---
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

// --- Skeleton Loading Components ---
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

// --- Helper Functions ---
const getLowestPriceCents = (itemData: ItemData): number => {
  if (itemData.variantsList && itemData.variantsList.length > 0) {
    const variantPrices = itemData.variantsList
      .map(variant => variant.localizedLowestPriceCents?.amountCents)
      .filter((price): price is number => price !== undefined);
    if (variantPrices.length > 0) {
      return Math.min(...variantPrices);
    }
  }
  return itemData.localizedRetailPriceCents?.amountCents || 9999;
};

// --- Memoized Child Components ---
interface DesktopItemProps {
  item: Item;
  renderPrice: (priceCents: number) => string;
  replaceText: (text: string) => string;
  priority: boolean;
}
const DesktopItem = memo(({ item, renderPrice, replaceText, priority }: DesktopItemProps) => {
  const lowestPrice = getLowestPriceCents(item.data);
  return (
    <Link href={`/product/${item.data.slug}`} passHref target="_blank" rel="noopener noreferrer">
      <div className="text-white bg-black border border-neutral-700 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group">
        <div className="overflow-hidden rounded-t-lg relative flex-grow" style={{ aspectRatio: '1 / 1' }}>
          <Image
            className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
            src={item.data.pictureUrl}
            alt={replaceText(item.data.title)}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, (max-width: 1536px) 25vw, 20vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
        <div className="w-full text-xs font-bold flex items-center p-4 border-t border-neutral-700 justify-between relative transition-colors duration-300 group-hover:border-neutral-500">
          <span className="truncate pr-2">{replaceText(item.data.title)}</span>
          <div
            className={`py-2 px-2 rounded-full whitespace-nowrap transition-all duration-300 ease-out min-w-[90px] text-center relative overflow-hidden ${
              lowestPrice === 0
                ? 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                : 'bg-neutral-800 backdrop-brightness-90 border border-neutral-700 group-hover:bg-neutral-600 group-hover:border-neutral-500'
            }`}
          >
            {lowestPrice === 0 || !item.data.inStock ? (
              <span className="block">Unavailable</span>
            ) : (
              <>
                <span className="block group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
                  {renderPrice(lowestPrice)}
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
DesktopItem.displayName = 'DesktopItem';

interface MobileItemProps {
  item: Item;
  renderPrice: (priceCents: number) => string;
  replaceText: (text: string) => string;
  priority: boolean;
}
const MobileItem = memo(({ item, renderPrice, replaceText, priority }: MobileItemProps) => {
  const lowestPrice = getLowestPriceCents(item.data);
  return (
    <Link href={`/product/${item.data.slug}`} passHref target="_blank" rel="noopener noreferrer">
      <div className="text-white bg-black border border-neutral-800 rounded tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neutral-600 h-full flex flex-col group">
        <div className="block w-full text-xs font-bold flex items-center p-2 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-700">
          <span className="block">{lowestPrice === 0 || !item.data.inStock ? 'Unavailable' : renderPrice(lowestPrice)}</span>
        </div>
        <div className="overflow-hidden rounded-b-lg relative flex-grow" style={{ aspectRatio: '1 / 1' }}>
          <Image
            className="rounded-b-lg mx-auto transition-transform duration-500 group-hover:scale-110 object-cover"
            src={item.data.pictureUrl}
            alt={replaceText(item.data.title)}
            fill
            unoptimized
            sizes="50vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
        <div className="w-full text-xs font-bold flex items-center p-3 border-t border-neutral-700 justify-center text-center relative group-hover:border-neutral-500 transition-colors duration-300">
          <span className="truncate">{replaceText(item.data.title)}</span>
        </div>
      </div>
    </Link>
  );
});
MobileItem.displayName = 'MobileItem';

interface CategoryCardProps {
  label: string;
  categoryUrl: string;
  images: CategoryImage[];
  replaceText: (text: string) => string;
  priority: boolean;
}
const CategoryCard = memo(({ label, categoryUrl, images, replaceText, priority }: CategoryCardProps) => {
  const firstImage = images?.[0];
  const secondImage = images?.[1];
  const thirdImage = images?.[2];

  if (!firstImage) return null;

  return (
    <div className="text-black rounded tracking-tight relative bg-black cursor-pointer transition-all duration-300 hover:shadow-md h-fit flex flex-col group">
      <Link href={categoryUrl} passHref>
        <div className="w-full flex justify-between items-center text-lg md:text-xl font-bold bg-white text-black p-4 border-b border-neutral-200 relative transition-colors duration-300 group-hover:bg-neutral-50">
          <span className="truncate pr-2">{replaceText(label)}</span>
          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 text-neutral-600 flex-shrink-0" />
        </div>
      </Link>
      <Link href={categoryUrl} passHref className="block flex-grow">
        <div
          className="relative overflow-hidden bg-black group-hover:bg-black transition-colors duration-300"
          style={{ aspectRatio: '1 / 1' }}
        >
          {firstImage && (
            <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start" style={{ zIndex: 1 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-105" style={{ width: '130%', height: '130%' }}>
                <Image className="object-contain w-full h-full" src={firstImage.url} alt={firstImage.alt} fill unoptimized sizes="(max-width: 768px) 30vw, 15vw" priority={priority} loading={priority ? "eager" : "lazy"} />
              </div>
            </div>
          )}
          {secondImage && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-110" style={{ width: '75%', height: '75%' }}>
                <Image className="object-contain w-full h-full drop-shadow-md" src={secondImage.url} alt={secondImage.alt} fill unoptimized sizes="(max-width: 768px) 40vw, 20vw" priority={priority} loading={priority ? "eager" : "lazy"} />
              </div>
            </div>
          )}
          {thirdImage && (
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end" style={{ zIndex: 1 }}>
              <div className="relative transition-transform duration-300 group-hover:scale-105" style={{ width: '130%', height: '130%' }}>
                <Image className="object-contain w-full h-full" src={thirdImage.url} alt={thirdImage.alt} fill unoptimized sizes="(max-width: 768px) 30vw, 15vw" priority={priority} loading={priority ? "eager" : "lazy"} />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});
CategoryCard.displayName = 'CategoryCard';

// --- Product Scroller Component ---
const ProductScroller = memo(({ items, ItemComponent, renderPrice, replaceText, itemLimit, itemBaseClassName, priorityStartIndex = 4 }: ProductScrollerProps) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = useCallback(() => {
        const el = scrollerRef.current;
        if (el) {
            const tolerance = 2;
            const hasOverflow = el.scrollWidth > el.clientWidth + tolerance;
            setCanScrollLeft(el.scrollLeft > tolerance);
            setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - tolerance);
        }
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (el) {
            checkScrollability();
            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(el);
            el.addEventListener('scroll', checkScrollability, { passive: true });
            return () => {
                if(el) {
                    resizeObserver.unobserve(el);
                    el.removeEventListener('scroll', checkScrollability);
                }
            };
        }
    }, [checkScrollability, items]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollerRef.current;
        if (el) {
            const scrollAmount = el.clientWidth * 0.5; // Scroll by half a page
            el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const limitedItems = itemLimit ? items.slice(0, itemLimit) : items;

    if (limitedItems.length === 0) {
        return <p className="text-neutral-500 text-center py-4 col-span-full">No items found in this collection.</p>;
    }

    return (
        <div className="relative">
            <button onClick={() => scroll('left')} aria-label="Scroll left" disabled={!canScrollLeft} className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 p-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-white shadow-xl transition-all duration-300 ease-in-out hover:bg-white/15 hover:scale-105 active:scale-95 pointer-events-auto disabled:opacity-30 disabled:pointer-events-none">
                <ChevronLeft size={24} />
            </button>

            <div ref={scrollerRef} className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory py-1" style={{ scrollbarWidth: 'none', 'msOverflowStyle': 'none', WebkitOverflowScrolling: 'touch' }}>
                {limitedItems.filter(item => item?.data?.pictureUrl).map((item, idx) => (
                    <div key={`${item.data.id}-${idx}`} className={`${itemBaseClassName} flex-shrink-0 snap-start p-0.5 md:p-1 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 2xl:w-1/6`}>
                        <ItemComponent item={item} renderPrice={renderPrice} replaceText={replaceText} priority={idx < priorityStartIndex} />
                    </div>
                ))}
            </div>

            <button onClick={() => scroll('right')} aria-label="Scroll right" disabled={!canScrollRight} className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 p-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-white shadow-xl transition-all duration-300 ease-in-out hover:bg-white/15 hover:scale-105 active:scale-95 pointer-events-auto disabled:opacity-30 disabled:pointer-events-none">
                <ChevronRight size={24} />
            </button>
         </div>
    );
});
ProductScroller.displayName = 'ProductScroller';


// --- Main Home Component ---
const Home = () => {
  const [sectionItems, setSectionItems] = useState<{ [title: string]: Item[] }>({});
  const [categoryData, setCategoryData] = useState<ProcessedSanityCategory[]>([]);
  const [collections, setCollections] = useState<CollectionDoc[]>([]);
  const [mntRate, setMntRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setPageData } = useProductContext();
  const sectionRefs = useRef<SectionRefs>({});
  const fetchedSections = useRef(new Set<string>());
  const [itemLimit, setItemLimit] = useState(18);
  const [skeletonCount, setSkeletonCount] = useState(6); // To match grid columns

  // --- NEW: Combined useEffect for screen-size-dependent variables ---
  useEffect(() => {
    const updateLayoutConfig = () => {
      const screenWidth = window.innerWidth;
      
      // Set item limit for product scrollers
      if (screenWidth >= 1024) { 
        setItemLimit(18); 
      } else { 
        setItemLimit(12); 
      }
      
      // Set skeleton count to match visible columns for a responsive placeholder
      if (screenWidth >= 1536) {      // 2xl: 6 cols
        setSkeletonCount(6);
      } else if (screenWidth >= 1024) { // lg/xl: 5 cols
        setSkeletonCount(5);
      } else if (screenWidth >= 768) {  // md: 4 cols
        setSkeletonCount(4);
      } else if (screenWidth >= 640) {  // sm: 3 cols
        setSkeletonCount(3);
      } else {                          // base: 2 cols
        setSkeletonCount(2);
      }
    };

    updateLayoutConfig();
    window.addEventListener('resize', updateLayoutConfig);
    return () => window.removeEventListener('resize', updateLayoutConfig);
  }, []);

  const replaceText = useCallback((text: string): string => {
    try {
      return String(text || '').replace(/GOAT/gi, 'SAINT').replace(/Canada/gi, 'MONGOLIA');
    } catch (e) {
      console.error("Error replacing text:", text, e);
      return text || '';
    }
  }, []);

  const renderPrice = (priceCents: number): string => {
    if (priceCents === 0 || priceCents === 9999) return 'Unavailable';
    if (mntRate === null) return '...';
    const price = (priceCents * mntRate) / 100;
    return `₮${Math.ceil(price).toLocaleString('en-US')}`;
  };

  const processCategoryData = useCallback((sanityDocs: SanityProductCategoryUrlDoc[]): ProcessedSanityCategory[] => {
    const allProcessedCategories: ProcessedSanityCategory[] = [];
    sanityDocs.forEach(doc => {
      const elements = [doc.el1, doc.el2, doc.el3, doc.el4];
      elements.forEach(el => {
        if (el && el.label && el.url1) {
          const categoryImages: CategoryImage[] = [];
          if (el.url1) categoryImages.push({ url: el.url1, alt: `${el.label} 1` });
          if (el.url2) categoryImages.push({ url: el.url2, alt: `${el.label} 2` });
          if (el.url3) categoryImages.push({ url: el.url3, alt: `${el.label} 3` });
          const categoryUrl = `/collections/${el.label.toLowerCase().replace(/\s+/g, '-')}`;

          if (categoryImages.length > 0) {
            allProcessedCategories.push({
              id: `${doc.category || 'default'}-${el.label}`,
              label: el.label,
              categoryUrl: categoryUrl,
              images: categoryImages,
            });
          }
        }
      });
    });
    return allProcessedCategories;
  }, []);

  useEffect(() => {
    const fetchAllInitialData = async () => {
      setIsLoading(true);
      setError(null);
      fetchedSections.current.clear();

      if (isCacheValid(homeCache.timestamp) && homeCache.collections && homeCache.mntRate && homeCache.sanityCategoryDocs) {
        console.log("Using cached initial data.");
        const { collections: cachedCollections, mntRate: cachedMntRate, sanityCategoryDocs: cachedSanityCategoryDocs } = homeCache;
        setCollections(cachedCollections!);
        setMntRate(cachedMntRate);
        const initialSectionItems: { [key: string]: Item[] } = {};
        cachedCollections!.forEach((collection, index) => {
          const sectionId = `${collection.name}-${index}`;
          if (collection.products) {
            initialSectionItems[sectionId] = collection.products
              .filter(p => p.pictureUrl)
              .map(p => ({ data: p, category: p.category || collection.name, categoryUrl: `/collections/${(p.category || collection.name).toLowerCase().replace(/\s+/g, '-')}`, collection: collection.name }));
          }
        });
        setSectionItems(initialSectionItems);
        if (cachedSanityCategoryDocs) {
            setCategoryData(processCategoryData(cachedSanityCategoryDocs));
        }
        if (setPageData && cachedCollections!.length > 0) {
          const firstId = `${cachedCollections![0].name}-0`;
          if (initialSectionItems[firstId]) {
            setPageData({ [firstId]: initialSectionItems[firstId] });
          }
        }
        setIsLoading(false);
        return;
      }

      console.log("Fetching all essential initial data...");
      try {
        const [productCollectionsRes, categoryUrlsRes, currencyRes] = await Promise.all([
          fetch(`/api/payload/collections?sort=order`).then(res => res.ok ? res.json() : Promise.reject(`Product Collections fetch failed: ${res.status}`)),
          fetch(`/api/payload/categories`).then(res => res.ok ? res.json() : Promise.reject(`Category URLs fetch failed: ${res.status}`)),
          fetch('https://hexarate.paikama.co/api/rates/latest/USD?target=MNT').then(res => res.ok ? res.json() : Promise.reject(`Currency fetch failed: ${res.status}`))
        ]);

        const collectionsArray: CollectionDoc[] = productCollectionsRes;
        const sortedCollections = collectionsArray
          .filter(c => !!c.url && !!c.name && typeof c.order === 'number')
          .sort((a, b) => a.order - b.order);

        const rate = currencyRes.data?.mid;
        if (!rate) throw new Error('MNT currency rate not available.');

        setCollections(sortedCollections);
        setMntRate(rate);

        const initialSectionItems: { [key: string]: Item[] } = {};
        sortedCollections.forEach((collection, index) => {
          const sectionId = `${collection.name}-${index}`;
          if (collection.products) {
            initialSectionItems[sectionId] = collection.products
              .filter(p => p.pictureUrl)
              .map(p => ({ data: p, category: p.category || collection.name, categoryUrl: `/collections/${(p.category || collection.name).toLowerCase().replace(/\s+/g, '-')}`, collection: collection.name }));
          } else {
            initialSectionItems[sectionId] = [];
          }
        });
        setSectionItems(initialSectionItems);

        if (categoryUrlsRes.length > 0) {
          setCategoryData(processCategoryData(categoryUrlsRes));
        }

        if (setPageData && sortedCollections.length > 0) {
          const firstId = `${sortedCollections[0].name}-0`;
          if (initialSectionItems[firstId]) {
            setPageData({ [firstId]: initialSectionItems[firstId] });
          }
        }
        
        homeCache = { collections: sortedCollections, sanityCategoryDocs: categoryUrlsRes, mntRate: rate, timestamp: Date.now() };
        console.log("Initial data fetched and processed.");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Critical error fetching initial data:", errorMessage);
        setError(`Failed to load page. ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllInitialData();
  }, [processCategoryData, setPageData]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionIndex = Number(entry.target.getAttribute('data-section-index'));
          const collection = collections[sectionIndex];
          if (collection) {
            // --- FIX: Changed `index` to `sectionIndex` ---
            const sectionId = `${collection.name}-${sectionIndex}`;
            if (!fetchedSections.current.has(sectionId)) {
              fetchedSections.current.add(sectionId);
            }
          }
        }
      });
    }, { threshold: 0.05, rootMargin: '200px 0px 200px 0px' });

    Object.values(sectionRefs.current).forEach((refObject) => {
      if (refObject.current) observer.observe(refObject.current);
    });

    return () => observer.disconnect();
  }, [collections]);

  const handleRetry = () => {
    homeCache = { collections: null, sanityCategoryDocs: null, mntRate: null, timestamp: null };
    setCollections([]);
    setSectionItems({});
    setCategoryData([]);
  };

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

  if (collections.length === 0 && categoryData.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center text-neutral-400 bg-neutral-900 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4 text-white">No Content Available</h2>
        <p className="text-neutral-500 mb-6">We couldn‘t find any content to display.</p>
        <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-150">Refresh Page</button>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden"> {/* Prevents horizontal scrollbar on the body */}
      {collections.length > 0 ? collections.map((collection, index) => {
        const sectionId = `${collection.name}-${index}`;
        const title = collection.name;
        const items = sectionItems[sectionId] || [];
        const categoriesToRender = categoryData;
        if (!sectionRefs.current[sectionId]) {
          sectionRefs.current[sectionId] = React.createRef<HTMLDivElement>();
        }
        return (
          <section key={sectionId} ref={sectionRefs.current[sectionId]} data-section-index={index} className="mb-20 md:mb-24" aria-label={replaceText(title)}>
            <header className="flex justify-between items-center mb-4 md:mb-6 px-4">
              <h2 className="font-extrabold text-white text-xl md:text-3xl relative truncate pr-4">{replaceText(title)}</h2>
              {(isLoading || items.length > 0) && (
                <Link className="text-neutral-300 hover:text-white font-semibold text-xs md:text-sm underline whitespace-nowrap flex-shrink-0" href={`/collections/${collection.name.toLowerCase().replace(/\s+/g, '-')}`} aria-label={`View all ${replaceText(title)}`}>View All</Link>
              )}
            </header>
            
            <div>
                <div className="block lg:hidden">
                    {isLoading ? (
                        <div className="flex overflow-hidden pl-4">
                            {[...Array(skeletonCount)].map((_, i) => (
                                <div key={`loading-prod-mob-${sectionId}-${i}`} className="w-1/2 sm:w-1/3 flex-shrink-0 p-1.5 md:p-2">
                                    <SkeletonCard />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ProductScroller items={items} ItemComponent={MobileItem} renderPrice={renderPrice} replaceText={replaceText} itemBaseClassName="w-1/2 sm:w-[45%]" priorityStartIndex={2} />
                    )}
                </div>

                <div className="hidden lg:block">
                    {isLoading ? (
                        <div className="flex overflow-hidden pl-4">
                            {[...Array(skeletonCount)].map((_, i) => (
                                <div key={`loading-prod-desk-${sectionId}-${i}`} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 2xl:w-1/6 flex-shrink-0 p-1.5 md:p-2">
                                    <SkeletonCard />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ProductScroller items={items} ItemComponent={DesktopItem} renderPrice={renderPrice} replaceText={replaceText} itemLimit={itemLimit} itemBaseClassName="lg:w-1/4 xl:w-1/5 2xl:w-1/6" priorityStartIndex={5} />
                    )}
                </div>
            </div>

            {isLoading && categoriesToRender.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 px-4 mt-8 mb-8">
                {[...Array(4)].map((_, i) => <SkeletonCategoryCard key={`loading-cat-${sectionId}-${i}`} />)}
              </div>
            ) : (
              categoriesToRender.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 px-4 mt-16 mb-8">
                  {categoriesToRender.map((category, idx) => (
                    <CategoryCard key={`${category.id}-${idx}`} label={category.label} images={category.images} categoryUrl={category.categoryUrl} replaceText={replaceText} priority={idx < 4} />
                  ))}
                </div>
              ) : null
            )}
          </section>
        );
      }) : (
        isLoading && (
          // --- UPDATED: Simplified single initial loading section ---
          <section className="mb-12 md:mb-16">
            <header className="flex justify-between items-center mb-6 md:mb-8 px-4">
              <div className="h-7 md:h-8 w-1/2 md:w-1/3 bg-neutral-700 rounded-lg animate-pulse"></div>
              <div className="h-5 md:h-6 w-1/4 md:w-1/6 bg-neutral-700 rounded-lg animate-pulse"></div>
            </header>
           
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2 px-4">
              {[...Array(skeletonCount)].map((_, i) => <SkeletonCard key={`initial-skel-prod-${i}`} />)}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 px-4 mt-8 mb-8">
              {[...Array(4)].map((_, i) => <SkeletonCategoryCard key={`initial-skel-cat-${i}`} />)}
            </div>
          </section>
        )
      )}
    </div>
  );
};

export default memo(Home);