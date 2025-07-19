'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import useCartStore from '../../../store/cartStore'; // Assuming this path is correct

// --- Interfaces ---
interface PriceData {
    sizeOption?: { presentation: string; };
    lastSoldPriceCents?: { amount: number | null | undefined; };
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
    details: string; // SKU
    gender: string[];
    midsole: string;
    mainPictureUrl: string;
    releaseDate: string;
    slug: string;
    upperMaterial: string;
    singleGender: string;
    story: string;
    productTemplateExternalPictures?: ProductImage[];
    localizedSpecialDisplayPriceCents?: { amountUsdCents: number | null | undefined; };
}

// Props for the ProductView component, passed from the server component
interface ProductViewProps {
    product: Product;
    priceData: PriceData[];
    recommendedProducts: Product[];
}

// --- Skeleton Loading Component ---
const ProductPageSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl">
                {/* Skeleton Product Details Section */}
                <div className="h-fit w-full flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Product Image Skeleton */}
                    <div className="flex flex-col items-center w-full lg:w-1/2">
                        <div className="relative h-[500px] sm:h-[600px] md:h-[700px] w-full flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                            {/* Placeholder for Image */}
                        </div>
                        {/* Thumbnail Skeleton */}
                        <div className="flex gap-2 mt-3 mb-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="border-2 p-1 rounded-lg border-white/20 bg-white/5 backdrop-blur-sm">
                                    <div className="w-[60px] h-[60px] bg-white/10 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Product Info Skeleton */}
                    <div className="text-white flex flex-col justify-start items-start w-full lg:w-1/2 p-4">
                        {/* Category/Type Skeleton */}
                        <div className="flex space-x-2 mb-2 w-full">
                            <div className="h-4 bg-white/20 backdrop-blur-sm rounded w-1/4"></div>
                            <div className="h-4 bg-white/20 backdrop-blur-sm rounded w-1/12"></div>
                            <div className="h-4 bg-white/20 backdrop-blur-sm rounded w-1/3"></div>
                        </div>
                        {/* Title Skeleton */}
                        <div className="h-10 bg-white/20 backdrop-blur-sm rounded w-3/4 mb-4"></div>
                        {/* Brand Skeleton */}
                        <div className="h-6 bg-white/20 backdrop-blur-sm rounded w-1/2 mb-6"></div>
                        {/* Divider Skeleton */}
                        <div className="bg-white/20 backdrop-blur-sm w-full h-[1px] my-6 md:my-10"></div>
                        {/* Size Selection Skeleton */}
                        <div className="relative text-left w-full space-y-4 mt-4">
                            <div className="h-4 bg-white/20 backdrop-blur-sm rounded w-1/5 mb-2"></div>
                            <div className="h-16 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full w-full"></div>
                        </div>
                        {/* Buy Box Skeleton */}
                        <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 mt-8 p-6 rounded-2xl">
                            <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-1/3 mb-2"></div>
                            <div className="h-8 bg-white/20 backdrop-blur-sm rounded w-1/2 mb-6"></div>
                            <div className="h-12 bg-white/20 backdrop-blur-sm rounded-full w-32"></div>
                        </div>
                    </div>
                </div>

                {/* Product Details Table Skeleton */}
                <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 mt-8 p-6 md:p-8 rounded-2xl">
                    <div className="h-6 bg-white/20 backdrop-blur-sm rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-white">
                        {[...Array(8)].map((_, index) => (
                            <div key={index}>
                                <div className="h-4 bg-white/20 backdrop-blur-sm rounded w-1/4 mb-1"></div>
                                <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-1/2"></div>
                            </div>
                        ))}
                        {/* Story Skeleton */}
                        <div className="sm:col-span-2 mt-4">
                            <div className="h-4 bg-white/20 backdrop-blur-sm rounded w-1/5 mb-1"></div>
                            <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-full mb-1"></div>
                            <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-2/3"></div>
                        </div>
                    </div>
                </div>

                {/* Recommended Products Skeleton */}
                <div className="mt-12">
                    <div className="h-8 bg-white/20 backdrop-blur-sm rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="text-white bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg relative h-full flex flex-col">
                                <div className="overflow-hidden rounded-t-lg relative bg-white/10 backdrop-blur-sm" style={{ aspectRatio: '1 / 1' }}>
                                    {/* Image Placeholder */}
                                </div>
                                <div className="w-full border-t p-3 md:p-4 border-white/20 mt-auto flex-grow flex flex-col justify-between">
                                    <div className="h-8 bg-white/20 backdrop-blur-sm rounded w-3/4 mb-2"></div>
                                    <div className="h-6 bg-white/20 backdrop-blur-sm rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Client Component ---
export default function ProductView({ product: initialProduct, priceData: initialPriceData, recommendedProducts: initialRecommendedProducts }: ProductViewProps) {
    // --- State Variables ---
    const [product, setProduct] = useState<Product | null>(initialProduct);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>(initialRecommendedProducts);
    const [newTypeProduct, setNewTypeProduct] = useState<PriceData[]>(initialPriceData);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [mntRate, setMntRate] = useState<number | null>(null);

    const addToCart = useCartStore((state) => state.addToCart);

    // --- Effects ---
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

    // Effect to update component state when props change (e.g., on navigation)
    useEffect(() => {
        setProduct(initialProduct);
        setNewTypeProduct(initialPriceData);
        setRecommendedProducts(initialRecommendedProducts);
        // Reset interactive state
        setSelectedSize(null);
        setIsOpen(false);
        setError(null);
        setSelectedImageIndex(0);
        setDirection(0);
    }, [initialProduct, initialPriceData, initialRecommendedProducts]);

    // --- Event Handlers ---
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

        const selectedProductVariant = newTypeProduct.find((item: PriceData) => item.sizeOption?.presentation === selectedSize);

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

    // --- Derived Data for Rendering ---
    const imagesForPagination = product?.productTemplateExternalPictures?.map((img) => img.mainPictureUrl).filter(Boolean) as string[] ?? [];
    if (product && imagesForPagination.length === 0 && product.mainPictureUrl) {
        imagesForPagination.push(product.mainPictureUrl);
    }

    const sizeOptions = [...new Set(newTypeProduct?.map((item: PriceData) => item.sizeOption?.presentation))].filter((size): size is string => typeof size === 'string').sort((a, b) => {
        const sizeA = parseFloat(a);
        const sizeB = parseFloat(b);
        if (isNaN(sizeA) || isNaN(sizeB)) return a.localeCompare(b);
        return sizeA - sizeB;
    });

    const selectedVariantData = newTypeProduct.find((item: PriceData) => item.sizeOption?.presentation === selectedSize);
    const selectedVariantPrice = selectedVariantData?.lastSoldPriceCents?.amount;
    const canAddToCart = selectedVariantData && selectedVariantPrice && selectedVariantPrice > 0 && mntRate !== null;

    // --- Framer Motion Variants ---
    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    // --- Helper Functions ---
    const formattedReleaseDate = () => {
        if (!product || !product.releaseDate) return 'N/A';
        if (product.releaseDate.length === 8) {
            try {
                const year = product.releaseDate.substring(0, 4);
                const month = product.releaseDate.substring(4, 6);
                const day = product.releaseDate.substring(6, 8);
                const monthNum = parseInt(month, 10);
                const dayNum = parseInt(day, 10);
                if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
                    return new Date(`${year}-${month}-${day}T00:00:00Z`).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                    });
                }
                return product.releaseDate;
            } catch (e) {
                console.error("Error formatting release date:", e, product.releaseDate);
                return product.releaseDate;
            }
        }
        return product.releaseDate || 'N/A';
    };

    // --- Render Logic ---
    if (!product) return <ProductPageSkeleton />;
    if (error) return <div className="text-red-500 text-center p-10">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen  ">
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl">
                {/* Product Details Section */}
                <div className="h-fit w-full flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Product Image with Swipe */}
                    <div className="flex flex-col items-center relative w-full lg:w-1/2">
                        <div className="relative h-[500px] sm:h-[600px] md:h-[700px] w-full flex items-center justify-center bg-white backdrop-blur-sm rounded-4xl overflow-hidden group cursor-grab active:cursor-grabbing border border-white/20 shadow-xl">
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
                                        transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 }, }}
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
                                    <button onClick={() => paginate(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 shadow-lg">
                                        <ArrowLeftIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => paginate(1)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/20 shadow-lg">
                                        <ArrowRightIcon className="h-5 w-5" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10 p-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg">
                                        {imagesForPagination.map((_, index) => (
                                            <button 
                                                key={index} 
                                                onClick={() => { 
                                                    const newDirection = index > selectedImageIndex ? 1 : (index < selectedImageIndex ? -1 : 0); 
                                                    setDirection(newDirection); 
                                                    setSelectedImageIndex(index); 
                                                }} 
                                                aria-label={`Go to image ${index + 1}`} 
                                                className={`
                                                    h-2 w-2 rounded-full transition-all duration-300 ease-out
                                                    ${selectedImageIndex === index 
                                                        ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-white/30 ring-1 ring-white/40 scale-125' 
                                                        : 'bg-white/25 backdrop-blur-sm hover:bg-white/50 hover:shadow-md hover:shadow-white/20 hover:scale-110 ring-1 ring-white/15'
                                                    }
                                                `} 
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {imagesForPagination.length > 1 && (
                            <div className="flex flex-wrap justify-center gap-2 mt-3 mb-4">
                                {imagesForPagination.map((img: string, index: number) => (
                                    <button key={index} onClick={() => { const newDirection = index > selectedImageIndex ? 1 : (index < selectedImageIndex ? -1 : 0); setDirection(newDirection); setSelectedImageIndex(index); }} aria-label={`Select image ${index + 1}`} className={`border-2 p-1 rounded-lg transition-all duration-300 backdrop-blur-sm ${selectedImageIndex === index ? 'border-white/80 bg-white/10 shadow-lg' : 'border-white/20 hover:border-white/60 bg-white/5 hover:bg-white/10'}`}>
                                        <Image src={img} alt={`Thumbnail ${index + 1}`} width={60} unoptimized height={60} className="rounded-md object-cover bg-white" onError={(e) => e.currentTarget.src = '/placeholder.png'} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* End Left Column */}

                    {/* Right Column: Product Info */}
                    <div className="text-white flex flex-col justify-start items-start w-full lg:w-1/2 lg:p-4">
                        <span className="flex space-x-1 text-sm text-white/70 mb-2">
                            <Link href={`/category/${product.productCategory.toLowerCase()}`} className="hover:underline hover:text-white transition-colors duration-200 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md">{product.productCategory}</Link>
                            <p className="text-white/50">/</p>
                            <Link href={`/type/${product.productType.toLowerCase()}`} className="hover:underline hover:text-white transition-colors duration-200 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md">{product.productType}</Link>
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-[45px] tracking-tight leading-tight font-bold mb-4 text-white drop-shadow-lg">{product.name}</h1>
                        <p className="text-lg text-white/80 mb-6 bg-white/5 backdrop-blur-sm px-3 py-1 rounded-lg">{product.brandName}</p>
                        <div className="bg-white/20 backdrop-blur-sm w-full h-[1px] my-6 md:my-10"></div>

                        {/* Size selection */}
                        <div className="relative text-left w-full space-y-4 mt-4">
                            <label htmlFor="size-select-button" className="block text-sm font-medium text-white/80 mb-2">Size (US Men&apos;s):</label>
                            <button
                                id="size-select-button"
                                onClick={toggleDropdown}
                                disabled={sizeOptions.length === 0}
                                className={`w-full bg-black/30 backdrop-blur-xl flex border border-white/20 justify-between font-semibold text-white px-2 py-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-opacity-50 transition-all duration-300 ease-in-out items-center hover:bg-black/50 hover:border-white/40 ${sizeOptions.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                                aria-haspopup="listbox"
                                aria-expanded={isOpen}
                            >
                                <div className="flex w-full justify-between px-4 py-2 items-center">
                                    <span className={`${selectedSize ? 'text-white' : 'text-white/60'}`}>
                                        {selectedSize ? `US ${selectedSize}` : (sizeOptions.length > 0 ? 'Select Size' : 'No sizes available')}
                                    </span>
                                    <ChevronDownIcon className={`h-5 w-5 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="origin-top absolute left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-2xl shadow-2xl bg-black/50 backdrop-blur-xl border border-white/20 z-20"
                                        style={{ transformOrigin: 'top' }}
                                        role="listbox"
                                    >
                                        <div className="grid grid-cols-3 gap-2 p-4">
                                            {sizeOptions.length > 0 ? (
                                                sizeOptions.map((size) => {
                                                    const usSizeNum = parseFloat(size);
                                                    const euSize = !isNaN(usSizeNum) ? Math.round((usSizeNum + 33) * 1.0) : null;
                                                    return (
                                                        <button
                                                            key={size}
                                                            onClick={() => handleSizeSelect(size)}
                                                            role="option"
                                                            aria-selected={selectedSize === size}
                                                            className={`block w-full px-2 py-3 text-sm bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-center text-white transition-all duration-300 hover:bg-black/50 hover:border-white/40 hover:scale-105 ${selectedSize === size ? 'ring-2 ring-white/50 bg-white/10 shadow-lg' : ''}`}
                                                        >
                                                            {euSize && <div className="font-semibold">EU {euSize}</div>}
                                                            <div className={`text-xs ${euSize ? 'text-white/70' : 'font-semibold'}`}>US {size}</div>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <p className="col-span-3 text-center text-white/60 py-4">No sizes available.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* MNT Rate Loading/Error message for Buy Box */}
                        {mntRate === null && !error?.includes('Failed to fetch currency') && (
                            <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 mt-8 p-6 rounded-2xl font-semibold shadow-xl">
                                <p className="text-yellow-400">Loading price information...</p>
                            </div>
                        )}
                        {mntRate === null && error?.includes('Failed to fetch currency') && (
                            <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 mt-8 p-6 rounded-2xl font-semibold shadow-xl">
                                <p className="text-red-400">Could not load price information. Currency data unavailable.</p>
                            </div>
                        )}

                        {/* Buy/Price Section */}
                        {mntRate !== null && (
                            <div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 mt-8 p-6 rounded-2xl font-semibold shadow-xl">
                                {selectedSize ? (
                                    selectedVariantData ? (
                                        <>
                                            <h2 className="text-white/80 text-sm mb-1">Buy Now</h2>
                                            <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                                                {(selectedVariantPrice === null || selectedVariantPrice === undefined || selectedVariantPrice <= 0 || mntRate === null)
                                                    ? 'Unavailable'
                                                    : `₮${((selectedVariantPrice * mntRate) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                                }
                                            </span>
                                            <div className="mt-6">
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={!canAddToCart}
                                                    className={`px-6 py-3 rounded-full font-bold text-base transition-all duration-300 ease-in-out backdrop-blur-sm shadow-lg ${canAddToCart ? 'bg-white/95 text-black hover:bg-white hover:scale-105 active:scale-95' : 'bg-white/30 text-white/60 cursor-not-allowed'}`}
                                                >
                                                    {canAddToCart ? 'Add to Cart' : (selectedVariantPrice && selectedVariantPrice > 0 ? 'Select Size First' : 'Unavailable')}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
<p className="text-yellow-400">Selected size not currently available</p>
                    )
                ) : (
                    <p className="text-white/60">Please select a size to see pricing</p>
                )}
            </div>
        )}
    </div>
</div>

{/* Product Details Table */}
<div className="w-full bg-black/30 backdrop-blur-xl border border-white/20 mt-8 p-6 md:p-8 rounded-2xl shadow-xl">
    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 drop-shadow-lg">Product Details</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-white">
        <div>
            <span className="text-white/60 text-sm block mb-1">SKU</span>
            <span className="text-white font-medium">{product.details || 'N/A'}</span>
        </div>
        <div>
            <span className="text-white/60 text-sm block mb-1">Color</span>
            <span className="text-white font-medium">{product.color || 'N/A'}</span>
        </div>
        <div>
            <span className="text-white/60 text-sm block mb-1">Gender</span>
            <span className="text-white font-medium">{product.gender?.join(', ') || 'N/A'}</span>
        </div>
        <div>
            <span className="text-white/60 text-sm block mb-1">Upper Material</span>
            <span className="text-white font-medium">{product.upperMaterial || 'N/A'}</span>
        </div>
        <div>
            <span className="text-white/60 text-sm block mb-1">Midsole</span>
            <span className="text-white font-medium">{product.midsole || 'N/A'}</span>
        </div>
        <div>
            <span className="text-white/60 text-sm block mb-1">Release Date</span>
            <span className="text-white font-medium">{formattedReleaseDate()}</span>
        </div>
        {selectedSize && selectedVariantData && (
            <>
                <div>
                    <span className="text-white/60 text-sm block mb-1">Stock Status</span>
                    <span className="text-white font-medium">{selectedVariantData.stockStatus || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-white/60 text-sm block mb-1">Shoe Condition</span>
                    <span className="text-white font-medium">{selectedVariantData.shoeCondition || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-white/60 text-sm block mb-1">Box Condition</span>
                    <span className="text-white font-medium">{selectedVariantData.boxCondition || 'N/A'}</span>
                </div>
            </>
        )}
        {product.story && (
            <div className="sm:col-span-2 mt-4">
                <span className="text-white/60 text-sm block mb-1">Story</span>
                <p className="text-white font-medium leading-relaxed">{product.story}</p>
            </div>
        )}
    </div>
</div>

{/* Recommended Products */}
{recommendedProducts && recommendedProducts.length > 0 && (
    <div className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg">You Might Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {recommendedProducts.map((recProduct) => (
                <Link 
                    key={recProduct.id} 
                    href={`/product/${recProduct.slug}`}
                    className="group text-white bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg relative h-full flex flex-col transition-all duration-300 hover:bg-black/50 hover:border-white/30 hover:scale-105 hover:shadow-xl"
                >
                    <div className="overflow-hidden rounded-t-lg relative bg-white/95 backdrop-blur-sm group-hover:bg-white transition-all duration-300" style={{ aspectRatio: '1 / 1' }}>
                        <Image
                            src={recProduct.mainPictureUrl || '/placeholder.png'}
                            alt={recProduct.name}
                            fill
                            style={{ objectFit: 'contain' }}
                            className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            unoptimized
                            onError={(e) => e.currentTarget.src = '/placeholder.png'}
                        />
                    </div>
                    <div className="w-full border-t p-3 md:p-4 border-white/20 mt-auto flex-grow flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-sm md:text-base leading-tight mb-2 line-clamp-2 group-hover:text-white/90 transition-colors duration-300">
                                {recProduct.name}
                            </h3>
                            <p className="text-xs md:text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                                {recProduct.brandName}
                            </p>
                        </div>
                        {recProduct.localizedSpecialDisplayPriceCents?.amountUsdCents && mntRate && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                                <span className="text-sm md:text-base font-bold text-white/90 group-hover:text-white transition-colors duration-300">
                                    ₮{((recProduct.localizedSpecialDisplayPriceCents.amountUsdCents * mntRate) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    </div>
)}
</div>

{/* Toast Container */}
<Toaster 
    position="top-center" 
    toastOptions={{
        duration: 3000,
        style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
        },
    }}
/>
</div>
);
}