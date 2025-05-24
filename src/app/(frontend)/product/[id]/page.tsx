'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import useCartStore from '../../../store/cartStore'; //Assumingthispathiscorrect
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

// --- Interfaces (Keep these as they are) ---
interface PriceData {
  sizeOption?: {
    presentation: string;
  };
  lastSoldPriceCents?: {
    amount: number | null | undefined;
  };
  stockStatus: string;
  shoeCondition: string;
  boxCondition: string;
}
interface ProductImage {
  mainPictureUrl: string;
}
interface Product {
  id: string;
  name: string;
  productCategory: string;
  productType: string;
  color: string;
  brandName: string;
  details: string; //SKU
  gender: string[];
  midsole: string;
  mainPictureUrl: string;
  releaseDate: string;
  slug: string;
  upperMaterial: string;
  singleGender: string;
  story: string;
  productTemplateExternalPictures?: ProductImage[];
  localizedSpecialDisplayPriceCents?: {
    amountUsdCents: number | null | undefined;
  };
}

// --- Raw API Response Interfaces ---
interface RawApiProductData {
  id?: number | string;
  name?: string;
  category?: string;
  product_type?: string;
  colorway?: string;
  color?: string;
  brand?: string;
  sku?: string;
  gender?: string[];
  midsole?: string;
  image_url?: string;
  pictureUrl?: string;
  release_date?: string;
  slug?: string;
  upperMaterial?: string;
  singleGender?: string;
  description?: string;
  images?: string[];
  retail_prices?: {
    retail_price_cents_usd?: number | null;
  };
  specialDisplayPriceCents?: number | null;
}

interface RawApiRecommendedProduct {
  id?: number | string;
  name?: string;
  productCategory?: string;
  productType?: string;
  color?: string;
  details?: string; 
  brandName?: string;
  sku?: string;
  gender?: string[];
  midsole?: string;
  pictureUrl?: string;
  mainPictureUrl?: string;
  releaseDate?: string;
  slug?: string;
  upperMaterial?: string;
  singleGender?: string;
  story?: string;
  localizedSpecialDisplayPriceCents?: {
    amountUsdCents?: number | null;
  };
  specialDisplayPriceCents?: number | null;
}

interface ApiErrorShape {
  error: string;
}

// Type guard for ApiErrorShape
function isApiError(obj: unknown): obj is ApiErrorShape {
  return obj !== null && typeof obj === 'object' && 'error' in obj && typeof (obj as ApiErrorShape).error === 'string';
}

interface ApiResponseType {
  data?: {
    data?: RawApiProductData | ApiErrorShape; 
    status?: string; 
  } | ApiErrorShape; 
  PriceData?: PriceData[] | ApiErrorShape | null;
  recommendedProducts?: RawApiRecommendedProduct[] | ApiErrorShape | null;
}


// --- Skeleton Loading Component (Keep as is) ---
const ProductPageSkeleton = () => {
  // ...skeleton code remains the same...
  return (<div className="animate-pulse"><div className="bg-neutral-900 border border-neutral-700 p-4 sm:p-6 md:p-8 rounded-3xl">{/*SkeletonProductDetailsSection*/}<div className="h-fit w-full flex flex-col lg:flex-row gap-8">{/*LeftColumn:ProductImageSkeleton*/}<div className="flex flex-col items-center w-full lg:w-1/2"><div className="relative h-[500px] sm:h-[600px] md:h-[700px] w-full flex items-center justify-center bg-neutral-700 rounded-2xl overflow-hidden">{/*PlaceholderforImage*/}</div>{/*ThumbnailSkeleton*/}<div className="flex gap-2 mt-3 mb-4">{[...Array(4)].map((_, index) => (<div key={index} className="border-[2px] p-1 rounded-lg border-neutral-600"><div className="w-[60px] h-[60px] bg-neutral-700 rounded"></div></div>))}</div></div>{/*RightColumn:ProductInfoSkeleton*/}<div className="text-white flex flex-col justify-start items-start w-full lg:w-1/2 p-4">{/*Category/TypeSkeleton*/}<div className="flex space-x-2 mb-2 w-full"><div className="h-4 bg-neutral-700 rounded w-1/4"></div><div className="h-4 bg-neutral-700 rounded w-1/12"></div><div className="h-4 bg-neutral-700 rounded w-1/3"></div></div>{/*TitleSkeleton*/}<div className="h-10 bg-neutral-700 rounded w-3/4 mb-4"></div>{/*BrandSkeleton*/}<div className="h-6 bg-neutral-700 rounded w-1/2 mb-6"></div>{/*DividerSkeleton*/}<div className="bg-neutral-600 w-full h-[1px] my-6 md:my-10"></div>{/*OfferTypeButtonsSkeleton*/}<div className="w-full mb-6"><div className="h-4 bg-neutral-700 rounded w-1/5 mb-2"></div><div className="flex space-x-2 bg-neutral-800 p-1 rounded-full border border-neutral-700 items-center justify-start"><div className="h-10 bg-neutral-700 rounded-full flex-grow"></div><div className="h-10 bg-neutral-700 rounded-full flex-grow"></div><div className="h-10 bg-neutral-700 rounded-full flex-grow"></div></div></div>{/*SizeSelectionSkeleton*/}<div className="relative text-left w-full space-y-4 mt-4"><div className="h-4 bg-neutral-700 rounded w-1/5 mb-2"></div><div className="h-16 bg-neutral-800 border border-neutral-700 rounded-full w-full"></div></div>{/*BuyBoxSkeleton*/}<div className="w-full bg-neutral-800 border border-neutral-700 mt-8 p-6 rounded-2xl"><div className="h-5 bg-neutral-700 rounded w-1/3 mb-2"></div><div className="h-8 bg-neutral-700 rounded w-1/2 mb-6"></div><div className="h-12 bg-neutral-700 rounded-full w-32"></div></div></div></div>{/*ProductDetailsTableSkeleton*/}<div className="w-full bg-neutral-800 border border-neutral-700 mt-8 p-6 md:p-8 rounded-2xl"><div className="h-6 bg-neutral-700 rounded w-1/4 mb-6"></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-white">{[...Array(8)].map((_, index) => (<div key={index}><div className="h-4 bg-neutral-700 rounded w-1/4 mb-1"></div><div className="h-5 bg-neutral-700 rounded w-1/2"></div></div>))}{/*StorySkeleton*/}<div className="sm:col-span-2 mt-4"><div className="h-4 bg-neutral-700 rounded w-1/5 mb-1"></div><div className="h-5 bg-neutral-700 rounded w-full mb-1"></div><div className="h-5 bg-neutral-700 rounded w-2/3"></div></div></div></div>{/*RecommendedProductsSkeleton*/}<div className="mt-12"><div className="h-8 bg-neutral-700 rounded w-1/3 mb-6"></div><div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">{[...Array(5)].map((_, index) => (<div key={index} className="text-white bg-neutral-900 border border-neutral-800 rounded-lg relative h-full flex flex-col"><div className="overflow-hidden rounded-t-lg relative bg-neutral-700" style={{ aspectRatio: '1/1' }}>{/*ImagePlaceholder*/}</div><div className="w-full border-t p-3 md:p-4 border-neutral-700 mt-auto flex-grow flex flex-col justify-between"><div className="h-8 bg-neutral-700 rounded w-3/4 mb-2"></div>{/*NamePlaceholder*/}<div className="h-6 bg-neutral-700 rounded w-1/2"></div>{/*PricePlaceholder*/}</div></div>))}</div></div></div></div>);
};

// ---MainPageComponent---
function Page() {
  // ---StateVariables---
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [offerType, setOfferType] = useState<'new' | 'used' | 'offer'>('new');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mntRate, setMntRate] = useState<number | null>(null);
  const pathname = usePathname();
  const slug = pathname.split('/product/')[1] || 'default-slug';
  const addToCart = useCartStore((state) => state.addToCart);
  // ---DerivedState(Keepexistingones)---
  const [newTypeProduct, setNewTypeProduct] = useState<PriceData[]>([]);
  const [usedTypeProduct, setUsedTypeProduct] = useState<PriceData[]>([]);
  const [offerTypeProduct, setOfferTypeProduct] = useState<PriceData[]>([]);

  // ---Effects---
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const res = await fetch('/api/getcurrencydata');
        if (!res.ok) throw new Error('Failed to fetch currency data');
        const currencyResult = await res.json();
        if (currencyResult.mnt) {
          setMntRate(currencyResult.mnt);
        } else {
          console.warn('MNT rate not available from API');
          setError(prev => prev ? `${prev}, MNT rate not available` : 'MNT rate not available');
        }
      } catch (err) {
        console.error('Currency fetch error:', err);
        setError(prev => prev ? `${prev}, Failed to fetch currency` : 'Failed to fetch currency');
      }
    };
    fetchCurrencyData();
  }, []);

  useEffect(() => {
    if (!slug || slug === 'default-slug') {
      setError("Invalid product slug.");
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      setProduct(null);
      setRecommendedProducts([]);
      setNewTypeProduct([]);
      setUsedTypeProduct([]);
      setOfferTypeProduct([]);
      setSelectedSize(null);
      setOfferType('new');
      setIsOpen(false);
      setError(null);
      setIsLoading(true);
      setSelectedImageIndex(0);
      setDirection(0);

      try {
        const response = await fetch(`/api/hey?slug=${slug}`);
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const result = await response.json() as ApiResponseType;
        console.log('API Response:', result);

        // --- Core Product Data Check & Mapping (FIXED) ---
        if (!result || typeof result !== 'object') {
          throw new Error("API response is invalid or missing.");
        }

        if (result.data && isApiError(result.data)) {
          throw new Error(`API returned an error at data level: ${result.data.error}`);
        }
                
        const productContainer = result.data?.data; // This is RawApiProductData | ApiErrorShape | undefined
        if (productContainer && isApiError(productContainer)) {
          throw new Error(`API returned an error for product data: ${productContainer.error}`);
        }
        
        const apiProductData = productContainer as RawApiProductData | undefined;

        if (!apiProductData || typeof apiProductData !== 'object' || !apiProductData.id) { 
          let specificError = "Core product data (result.data.data) is invalid, incomplete, or missing.";
          if (!result.data) specificError = "result.data is missing in API response.";
          else if (!productContainer) specificError = "result.data.data is missing or not an object.";
          else if (apiProductData && !apiProductData.id) specificError = "Core product data is missing an 'id'."; // Check if apiProductData exists before checking id
          // Removed the nested error check here as it's covered above by isApiError(result.data)
          throw new Error(specificError);
        }
        
        const mappedProduct: Product = {
          id: String(apiProductData.id || apiProductData.sku || Date.now()),
          name: apiProductData.name || 'Unnamed Product',
          productCategory: apiProductData.category || 'N/A',
          productType: apiProductData.product_type || 'N/A',
          color: apiProductData.colorway || apiProductData.color || 'N/A',
          brandName: apiProductData.brand || 'N/A',
          details: apiProductData.sku || 'N/A',
          gender: apiProductData.gender || [],
          midsole: apiProductData.midsole || '',
          mainPictureUrl: apiProductData.image_url || apiProductData.pictureUrl || '/placeholder.png',
          releaseDate: apiProductData.release_date || '',
          slug: apiProductData.slug || slug,
          upperMaterial: apiProductData.upperMaterial || '',
          singleGender: apiProductData.singleGender || '',
          story: apiProductData.description || '',
          productTemplateExternalPictures: Array.isArray(apiProductData.images)
            ? apiProductData.images.map((imgUrl: string) => ({ mainPictureUrl: imgUrl }))
            : [],
          localizedSpecialDisplayPriceCents: {
            amountUsdCents: apiProductData.retail_prices?.retail_price_cents_usd ?? apiProductData.specialDisplayPriceCents ?? null,
          },
        };
        setProduct(mappedProduct);

        // --- Handle PriceData (Array or Error Object) (FIXED) ---
        let priceDataArray: PriceData[] = [];
        let priceDataApiError: string | null = null;
        if (result.PriceData === null) {
          console.log("PriceData is null, will use empty array.");
        } else if (Array.isArray(result.PriceData)) {
          priceDataArray = result.PriceData;
        } else if (result.PriceData && isApiError(result.PriceData)) {
          priceDataApiError = `PriceData Error: ${result.PriceData.error}`;
          console.error(priceDataApiError);
        } else if (result.PriceData) {
          console.warn("Received PriceData in an unexpected format:", result.PriceData);
        }
        
        // --- Handle RecommendedProducts (Array or Error Object) & Mapping (FIXED) ---s
        let recommendedProductsArray: Product[] = [];
        let recommendedProductsApiError: string | null = null;
        if (result.recommendedProducts === null) {
          console.log("recommendedProducts is null, will use empty array.");
        } else if (Array.isArray(result.recommendedProducts)) {
          recommendedProductsArray = result.recommendedProducts.map((rec: RawApiRecommendedProduct) => ({
            id: String(rec.id || rec.sku || Date.now()),
            name: rec.name || 'Unnamed Product',
            productCategory: rec.productCategory || 'N/A',
            productType: rec.productType || 'N/A',
            color: rec.color || rec.details || 'N/A',
            brandName: rec.brandName || 'N/A',
            details: rec.sku || 'N/A',
            gender: rec.gender || [],
            midsole: rec.midsole || '',
            mainPictureUrl: rec.pictureUrl || rec.mainPictureUrl || '/placeholder.png',
            releaseDate: rec.releaseDate || '',
            slug: rec.slug || '',
            upperMaterial: rec.upperMaterial || '',
            singleGender: rec.singleGender || '',
            story: rec.story || '',
            productTemplateExternalPictures: [],
            localizedSpecialDisplayPriceCents: {
              // FIXED: Make amountUsdCents required (not optional) to match Product interface
              amountUsdCents: rec.localizedSpecialDisplayPriceCents?.amountUsdCents ?? rec.specialDisplayPriceCents ?? null
            },
          }));
        } else if (result.recommendedProducts && isApiError(result.recommendedProducts)) { // FIXED: Used isApiError
          recommendedProductsApiError = `RecommendedProducts Error: ${result.recommendedProducts.error}`;
          console.error(recommendedProductsApiError);
        } else if (result.recommendedProducts) {
          console.warn("Received recommendedProducts in an unexpected format:", result.recommendedProducts);
        }
        setRecommendedProducts(recommendedProductsArray);
        
        const partialErrors = [priceDataApiError, recommendedProductsApiError].filter(Boolean).join('. ');
        if (partialErrors) {
          console.warn(`Could not load some page elements: ${partialErrors}`);
        }

        const availableProducts = priceDataArray.filter(
          (item) => (item.stockStatus === 'multiple_in_stock' || item.stockStatus === 'single_in_stock') && item.sizeOption?.presentation
        );
        const newProducts = availableProducts.filter(
          (item) => item.shoeCondition === 'new_no_defects' && item.boxCondition === 'good_condition'
        );
        const usedProducts = availableProducts.filter((item) => item.shoeCondition === 'used');
        const offerProducts = availableProducts.filter(
          (item) => (item.shoeCondition === 'new_no_defects' && item.boxCondition !== 'good_condition') || item.shoeCondition === 'new_with_defects'
        );
        setNewTypeProduct(newProducts);
        setUsedTypeProduct(usedProducts);
        setOfferTypeProduct(offerProducts);

        if (priceDataArray.length > 0 && newProducts.length === 0) {
          if (usedProducts.length > 0) setOfferType('used');
          else if (offerProducts.length > 0) setOfferType('offer');
        }

      } catch (err) {
        if (err instanceof Error) {
          console.error('Fetch error:', err);
          setError(err.message);
        } else {
          console.error('Unknown fetch error:', err);
          setError('An unknown error occurred while fetching product data.');
        }
        setProduct(null);
        setRecommendedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // ---EventHandlers---
  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setIsOpen(false);
  };

  const paginate = (newDirection: number) => {
    if (imagesForPagination.length <= 1) return;
    const newIndex = (selectedImageIndex + newDirection + imagesForPagination.length) % imagesForPagination.length;
    setDirection(newDirection);
    setSelectedImageIndex(newIndex);
  };
  
  const swipeConfidenceThreshold = 10000;
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipePower = Math.abs(offset.x) * velocity.x;
    if (swipePower < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipePower > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize || mntRate === null) {
      toast.error('Cannot add to cart. Missing product data, size, or currency rate.');
      return;
    }
    const selectedProductVariant = tailoredSizeData.find(
      (item: PriceData) => item.sizeOption?.presentation === selectedSize,
    );
    if (selectedProductVariant) {
      const priceCents = selectedProductVariant.lastSoldPriceCents?.amount;
      if (priceCents === null || priceCents === undefined || priceCents <= 0) {
        toast.error('Price is unavailable for the selected size.');
        return;
      }
      const price = (priceCents * mntRate) / 100;
      const imageUrl = imagesForPagination[selectedImageIndex] || product.mainPictureUrl || '/placeholder.png';
      addToCart(product, selectedSize, price, imageUrl);
      toast.success(`${product.name} (Size: ${selectedSize}) added to cart!`);
    } else {
      toast.error('Selected size is not available for purchase.');
    }
  };
  
  // ---DerivedDataforRendering---
  const imagesForPagination = product?.productTemplateExternalPictures?.map((img) => img.mainPictureUrl).filter(Boolean) as string[] ?? [];
  if (product && imagesForPagination.length === 0 && product.mainPictureUrl) {
    imagesForPagination.push(product.mainPictureUrl);
  }
  
  const tailoredSizeData =
    offerType === 'new' ? newTypeProduct :
    offerType === 'used' ? usedTypeProduct :
    offerType === 'offer' ? offerTypeProduct : [];

  const sizeOptions = [
    ...new Set(tailoredSizeData?.map((item: PriceData) => item.sizeOption?.presentation)),
  ]
    .filter((size): size is string => typeof size === 'string')
    .sort((a, b) => {
      const sizeA = parseFloat(a);
      const sizeB = parseFloat(b);
      if (isNaN(sizeA) || isNaN(sizeB)) return a.localeCompare(b);
      return sizeA - sizeB;
    });

  const selectedVariantData = tailoredSizeData.find(
    (item: PriceData) => item.sizeOption?.presentation === selectedSize,
  );
  const hasNewProducts = newTypeProduct.length > 0;
  const hasUsedProducts = usedTypeProduct.length > 0;
  const hasOfferProducts = offerTypeProduct.length > 0;
  const selectedVariantPrice = selectedVariantData?.lastSoldPriceCents?.amount;
  const canAddToCart = selectedVariantData && selectedVariantPrice && selectedVariantPrice > 0 && mntRate !== null;

  // ---FramerMotionVariants(Keepasis)---
  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  // ---RenderLogic---
  if (isLoading) return <ProductPageSkeleton />;
  if (error) return <div className="text-red-500 text-center p-10">Error: {error}</div>;
  if (!product) return <div className="text-white text-center p-10">Product not found or failed to load.</div>;

  // FIXED: Moved formattedReleaseDate helper function here for use in JSX
  const formattedReleaseDate = () => {
    if (!product || !product.releaseDate) return 'N/A';
    if (product.releaseDate.length === 8) { // Assuming YYYYMMDD
      try {
        const year = product.releaseDate.substring(0, 4);
        const month = product.releaseDate.substring(4, 6);
        const day = product.releaseDate.substring(6, 8);
        // Basic validation for month and day
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          return new Date(`${year}-${month}-${day}T00:00:00Z`).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' // Added timeZone UTC
          });
        }
        return product.releaseDate; // Return original if YYYYMMDD but invalid parts
      } catch (e) {
        console.error("Error formatting release date:", e, product.releaseDate);
        return product.releaseDate; // Fallback to original string on error
      }
    }
    // For other formats or if already formatted, return as is or N/A
    return product.releaseDate || 'N/A';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-black border border-neutral-700 p-4 sm:p-6 md:p-8 rounded-3xl">
        {/*ProductDetailsSection*/}
        <div className="h-fit w-full flex flex-col lg:flex-row gap-8">
          {/*LeftColumn:ProductImagewithSwipe*/}
          <div className="flex flex-col items-center relative w-full lg:w-1/2">
            <div className="relative h-[500px] sm:h-[600px] md:h-[700px] w-full flex items-center justify-center bg-white rounded-2xl overflow-hidden group cursor-grab active:cursor-grabbing">
              {imagesForPagination.length > 0 ? (
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={selectedImageIndex}
                    className="absolute inset-0 w-full h-full"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                  >
                    <Image
                      draggable="false"
                      src={imagesForPagination[selectedImageIndex]}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority={selectedImageIndex === 0}
                      sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 40vw"
                      unoptimized
                      className="w-full h-full pointer-events-none"
                      onError={(e) => e.currentTarget.src = '/placeholder.png'}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <p className="text-black">No image available</p>
              )}
              {imagesForPagination.length > 1 && (
                <>
                  <button onClick={() => paginate(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800/80 hover:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => paginate(1)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800/80 hover:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {imagesForPagination.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const newDirection = index > selectedImageIndex ? 1 : index < selectedImageIndex ? -1 : 0;
                          setDirection(newDirection);
                          setSelectedImageIndex(index);
                        }}
                        aria-label={`Go to image ${index + 1}`}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${selectedImageIndex === index ? 'bg-white scale-125' : 'bg-neutral-500 hover:bg-neutral-400'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {imagesForPagination.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-3 mb-4">
                {imagesForPagination.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newDirection = index > selectedImageIndex ? 1 : index < selectedImageIndex ? -1 : 0;
                      setDirection(newDirection);
                      setSelectedImageIndex(index);
                    }}
                    aria-label={`Select image ${index + 1}`}
                    className={`border-2 p-1 rounded-lg transition-colors duration-200 ${selectedImageIndex === index ? 'border-white' : 'border-transparent hover:border-neutral-500'}`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={60}
                      unoptimized
                      height={60}
                      className="rounded object-cover bg-white"
                      onError={(e) => e.currentTarget.src = '/placeholder.png'}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>{/*EndLeftColumn*/}
          {/*RightColumn:ProductInfo*/}
          <div className="text-white flex flex-col justify-start items-start w-full lg:w-1/2 lg:p-4">
            <span className="flex space-x-1 text-sm text-neutral-400 mb-2">
              <Link href={`/category/${product.productCategory.toLowerCase()}`} className="hover:underline hover:text-white">{product.productCategory}</Link>
              <p>/</p>
              <Link href={`/type/${product.productType.toLowerCase()}`} className="hover:underline hover:text-white">{product.productType}</Link>
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-[45px] tracking-tight leading-tight font-bold mb-4">{product.name}</h1>
            <p className="text-lg text-neutral-300 mb-6">{product.brandName}</p>
            <div className="bg-neutral-700 w-full h-[1px] my-6 md:my-10"></div>
            {/*Condition/OfferTypeSelection*/}
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Condition:</label>
              <div className="flex flex-wrap gap-2 bg-neutral-800 p-1 rounded-full border border-neutral-700 items-center justify-start">
                <button className={`text-sm md:text-base flex-grow ${offerType === 'new' ? 'bg-white text-black shadow-md' : 'bg-transparent text-neutral-400 hover:text-white'} border py-2 px-4 border-transparent font-semibold rounded-full inline-block transition-all duration-300 ease-in-out ${!hasNewProducts ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700/50'}`} onClick={() => { setOfferType('new'); setSelectedSize(null); }} disabled={!hasNewProducts} aria-pressed={offerType === 'new'}>New</button>
                <button className={`text-sm md:text-base flex-grow ${offerType === 'used' ? 'bg-white text-black shadow-md' : 'bg-transparent text-neutral-400 hover:text-white'} border py-2 px-4 border-transparent font-semibold rounded-full inline-block transition-all duration-300 ease-in-out ${!hasUsedProducts ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700/50'}`} onClick={() => { setOfferType('used'); setSelectedSize(null); }} disabled={!hasUsedProducts} aria-pressed={offerType === 'used'}>Used</button>
                <button className={`text-sm md:text-base flex-grow ${offerType === 'offer' ? 'bg-white text-black shadow-md' : 'bg-transparent text-neutral-400 hover:text-white'} border py-2 px-4 border-transparent font-semibold rounded-full inline-block transition-all duration-300 ease-in-out ${!hasOfferProducts ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700/50'}`} onClick={() => { setOfferType('offer'); setSelectedSize(null); }} disabled={!hasOfferProducts} aria-pressed={offerType === 'offer'}>Offer</button>
              </div>
              {!hasNewProducts && !hasUsedProducts && !hasOfferProducts && (
                <p className="text-sm text-yellow-500 mt-2">This product is currently unavailable in any condition.</p>
              )}
            </div>
            {/*Sizeselection*/}
            <div className="relative text-left w-full space-y-4 mt-4">
              <label htmlFor="size-select-button" className="block text-sm font-medium text-neutral-300 mb-2">Size (US Men&apos;s):</label>
              <button id="size-select-button" onClick={toggleDropdown} disabled={sizeOptions.length === 0} className={`w-full bg-neutral-900 flex border justify-between font-semibold border-neutral-700 text-white px-2 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors duration-200 ease-in-out items-center ${sizeOptions.length === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:border-neutral-500'}`} aria-haspopup="listbox" aria-expanded={isOpen}>
                <div className="flex w-full justify-between px-4 py-2 items-center">
                  <span className={`${selectedSize ? 'text-white' : 'text-neutral-400'}`}>{selectedSize ? `US ${selectedSize}` : (sizeOptions.length > 0 ? 'Select Size' : 'No sizes available')}</span>
                  <ChevronDownIcon className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={`origin-top absolute left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-2xl shadow-lg bg-neutral-800 border border-neutral-700 z-20`} style={{ transformOrigin: 'top' }} role="listbox">
                    <div className="grid grid-cols-3 gap-2 p-4">
                      {sizeOptions.length > 0 ? (sizeOptions.map((size) => {
                        const usSizeNum = parseFloat(size);
                        const euSize = !isNaN(usSizeNum) ? Math.round((usSizeNum + 33) * 1.0) : null; //SimpleEUconversion,adjustifneeded
                        return (
                          <button key={size} onClick={() => handleSizeSelect(size)} role="option" aria-selected={selectedSize === size} className={`block w-full px-2 py-3 text-sm bg-black border border-neutral-700 rounded-xl text-center text-white transition-colors duration-200 ${selectedSize === size ? 'ring-2 ring-white bg-neutral-700' : 'hover:bg-neutral-900 hover:border-neutral-600'}`}>
                            {euSize && <div className="font-semibold">EU {euSize}</div>}
                            <div className={`text-xs ${euSize ? 'text-neutral-400' : 'font-semibold'}`}>US {size}</div>
                          </button>
                        );
                      })) : (
                        <p className="col-span-3 text-center text-neutral-400 py-4">No sizes available for this condition.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/*MNTRateLoading/ErrormessageforBuyBox*/}
            {mntRate === null && !error?.includes('Failed to fetch currency') && ( // Check for specific currency error
                <div className="w-full bg-neutral-800 border border-neutral-700 mt-8 p-6 rounded-2xl font-semibold">
                    <p className="text-yellow-500">Loading price information...</p>
                </div>
            )}
            {mntRate === null && error?.includes('Failed to fetch currency') && (
                <div className="w-full bg-neutral-800 border border-neutral-700 mt-8 p-6 rounded-2xl font-semibold">
                    <p className="text-red-500">Could not load price information. Currency data unavailable.</p>
                </div>
            )}
            {/*Buy/PriceSection*/}
            {mntRate !== null && (
              <div className="w-full bg-neutral-800 border border-neutral-700 mt-8 p-6 rounded-2xl font-semibold">
                {selectedSize ? (
                  selectedVariantData ? (
                    <>
                      <h2 className="text-neutral-300 text-sm mb-1">Buy Now</h2>
                      <span className="text-2xl md:text-3xl font-bold text-white">
                        {(selectedVariantPrice === null || selectedVariantPrice === undefined || selectedVariantPrice <= 0 || mntRate === null)
                          ? 'Unavailable'
                          : `₮${((selectedVariantPrice * mntRate) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        }
                      </span>
                      <div className="mt-6">
                        <button onClick={handleAddToCart} disabled={!canAddToCart} className={`px-6 py-3 rounded-full font-bold text-base transition-all duration-300 ease-in-out ${canAddToCart ? 'bg-white text-black hover:bg-neutral-300 active:scale-95' : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'}`}>
                          {canAddToCart ? 'Add to Cart' : (selectedVariantPrice && selectedVariantPrice > 0 ? 'Select Size First' : 'Unavailable')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-yellow-500">Selected size not currently available for {offerType}.</p>
                  )
                ) : (
                  <p className="text-neutral-300">{sizeOptions.length > 0 ? 'Please select your size above.' : 'No sizes available to select.'}</p>
                )}
              </div>
            )}
          </div>{/*EndRightColumn*/}
        </div>{/*EndProductDetailsSectionFlex*/}
        {/*ProductDetailsTable*/}
        <div className="w-full bg-neutral-800 border border-neutral-700 mt-8 p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Product Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-white text-sm">
            <div><p className="text-neutral-400 font-medium">Brand</p><p>{product.brandName || 'N/A'}</p></div>
            <div><p className="text-neutral-400 font-medium">Colorway</p><p>{product.color || 'N/A'}</p></div>
            <div><p className="text-neutral-400 font-medium">Release Date</p><p>{formattedReleaseDate()}</p></div> {/* FIXED: Used helper function */}
            <div><p className="text-neutral-400 font-medium">Gender</p><p>{(product.gender && product.gender.length > 0 ? product.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ') : product.singleGender) || 'N/A'}</p></div>
            <div><p className="text-neutral-400 font-medium">Upper Material</p><p>{product.upperMaterial || 'N/A'}</p></div>
            <div><p className="text-neutral-400 font-medium">Midsole</p><p>{product.midsole || 'N/A'}</p></div>
            <div><p className="text-neutral-400 font-medium">SKU/Style Code</p><p>{product.details || 'N/A'}</p></div>
            <div><p className="text-neutral-400 font-medium">Product ID</p><p>{product.id || 'N/A'}</p></div>
            {product.story && (
              <div className="sm:col-span-2 mt-4">
                <p className="text-neutral-400 font-medium">Story</p>
                <p className="text-neutral-200 whitespace-pre-line">{product.story}</p>
              </div>
            )}
          </div>
        </div>
        {/*RecommendedProductsSection*/}
        {recommendedProducts.length > 0 && mntRate !== null && (
          <div className="mt-12">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {recommendedProducts.map((recProduct) => {
                const recPriceCents = recProduct.localizedSpecialDisplayPriceCents?.amountUsdCents;
                const recPriceMNT = (recPriceCents && mntRate) ? Math.ceil((recPriceCents * mntRate) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : null;
                return (
                  <Link href={`/product/${recProduct.slug}`} key={recProduct.id} passHref>
                    <div /* Using div instead of <a> for direct Link child */ className="text-white bg-neutral-900 border border-neutral-800 rounded-lg tracking-tight relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 hover:border-neutral-600 hover:scale-[1.02] h-full flex flex-col group overflow-hidden">
                      <div className="overflow-hidden rounded-t-lg relative w-full bg-white" style={{ aspectRatio: '1/1' }}>
                        <Image
                          className="rounded-t-lg mx-auto transition-transform duration-500 group-hover:scale-105 object-contain"
                          src={recProduct.mainPictureUrl || '/placeholder.png'}
                          alt={recProduct.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          onError={(e) => e.currentTarget.src = '/placeholder.png'}
                        />
                      </div>
                      <div className="w-full text-xs font-semibold flex flex-col justify-between border-t p-3 md:p-4 border-neutral-700 relative flex-grow">
                        <p className="line-clamp-2 mb-2 h-[2.5em] overflow-hidden">{recProduct.name}</p>
                        <div className="mt-auto text-sm font-bold">
                          {recPriceMNT !== null ? `₮${recPriceMNT}` : <span className="text-neutral-400 text-xs">Price unavailable</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
         {recommendedProducts.length > 0 && mntRate === null && (
            <div className="mt-12">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">You Might Also Like</h2>
                <p className="text-yellow-500">Loading recommendations...</p>
            </div>
        )}
      </div>{/*Endmaincontentcontainer*/}
      <Toaster position="bottom-center" richColors theme="dark" />
    </div>
  );
}
export default Page;