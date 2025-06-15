'use client';

import { useState, useEffect } from 'react';
import useCartStore from '../../store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, ShoppingBag, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

interface CartItem {
  product: {
    id: string;
    name: string;
    image_url?: string;
    mainPictureUrl?: string;
  };
  size: string;
  quantity: number;
  price: number;
}

export default function BagPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCartStore();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Calculate subtotal (sum of all items' prices * quantities)
  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  
  // Calculate commission (15% of each item's price * quantity)
  const commission = cart.reduce((sum: number, item: CartItem) => {
    return sum + (item.price * item.quantity * 0.15);
  }, 0);
  
  // Fixed delivery fee
  const deliveryFee = 5000;
  
  // Calculate total (subtotal + commission + delivery)
  const total = subtotal + commission + deliveryFee;
  
  const itemCount = cart.reduce((count: number, item: CartItem) => count + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.warning('Төлбөр хийхийн тулд эхлээд нэвтэрнэ үү.', {
        style: { background: '#f97316', color: 'white', border: 'none', borderRadius: '12px' },
        duration: 3000,
      });
      router.push('/auth/login');
      return;
    }
    if (cart.length === 0) {
      toast.warning('Таны сагс хоосон байна', {
        style: { background: '#f97316', color: 'white', border: 'none', borderRadius: '12px' },
        duration: 3000,
      });
      return;
    }
    router.push('/payment');
  };

  const handleRemoveItem = (id: string, size: string) => {
    removeFromCart(id, size);
    toast.success('Бараа сагснаас хасагдлаа', {
      style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px' },
      duration: 2000,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Сагс цэвэрлэгдлээ', {
      style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px' },
      duration: 2000,
    });
  };

  const handleQuantityChange = (id: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id, size);
      return;
    }
    if (updateQuantity) {
      updateQuantity(id, size, newQuantity);
    } else {
      console.error('updateQuantity function is not available in cart store');
      toast.error('Тоо ширхэг шинэчилж чадсангүй', {
        style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px' },
      });
    }
  };
 
  return (
    <div className="min-h-screen bg-black text-neutral-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ">
      <Toaster position="bottom-right" className="z-[100]" />

      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-y-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-3xl font-semibold">Таны Сагс</h1>
            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 rounded-full px-3 py-1 text-sm">
              {itemCount} {itemCount === 1 ? 'бараа' : 'бараа'}
            </Badge>
          </div>
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 px-0 hover:bg-transparent text-sm"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4" />
            Дэлгүүр рүү буцах
          </Button>
        </div>

        {/* Conditional Rendering: Empty Cart or Cart Items */}
        {cart.length === 0 ? (
          // --- Empty Cart View ---
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 sm:p-12 text-center mt-10 flex flex-col items-center">
            <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-neutral-800/50 mb-6 border border-neutral-700">
              <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 mb-3">Таны сагс хоосон байна</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto text-base sm:text-lg">
              Дэлгүүрт зочлоод хүссэн бүтээгдэхүүнээ сонгоно уу
            </p>
            <Link href="/">
              <Button size="lg" className="bg-white hover:bg-neutral-100 text-black font-medium px-6 py-4 text-sm sm:px-8 sm:py-5 sm:text-base rounded-full">
                Дэлгүүр рүү буцах
              </Button>
            </Link>
          </div>
        ) : (
          // --- Cart Items and Summary View ---
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item: CartItem) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex justify-between items-start p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-md hover:shadow-neutral-700/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 sm:gap-5 flex-1">
                      {/* Product Image */}
                      <Link href={`/product/${item.product.id}`}>
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-neutral-700">
                          {item.product.mainPictureUrl ? (
                            <Image
                              src={item.product.mainPictureUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              unoptimized
                              sizes="(max-width: 640px) 96px, 112px"
                              loading="lazy"
                              onError={() => console.error(`Failed to load image for ${item.product.name}: ${item.product.image_url}`)}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-neutral-600">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-col justify-between h-full flex-1 mt-0 sm:mt-1 space-y-1.5 sm:space-y-2">
                      <Link href={`/product/${item.product.id}`}>
  <h2 className={`
    relative inline-block text-base sm:text-lg font-medium text-neutral-100 leading-tight
    transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)]
    before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-full
    before:bg-white before:origin-left before:transform before:scale-x-0
    before:transition-transform before:duration-600 before:ease-[cubic-bezier(0.23,1,0.32,1)]
    hover:before:scale-x-100 hover:transform hover:translate-y-[-1px]
    hover:text-white/90
  `}>
    {item.product.name}
  </h2>
</Link>

                        {/* Details container */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700 rounded-md px-2.5 py-0.5 text-xs self-start">
                            Хэмжээ: {item.size}
                          </Badge>
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-neutral-700 rounded-full overflow-hidden h-8 self-start">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQuantityChange(item.product.id, item.size, item.quantity - 1);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex items-center justify-center h-8 min-w-[32px] px-2 text-sm font-medium bg-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQuantityChange(item.product.id, item.size, item.quantity + 1);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {/* Price */}
                        <p className="text-base sm:text-lg font-semibold text-neutral-100 pt-1">
                          {(item.price * item.quantity).toLocaleString()}₮
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product.id, item.size)}
                      className="p-1.5 sm:p-2 rounded-full text-neutral-500 hover:bg-neutral-800 hover:text-red-400 transition-all flex-shrink-0 ml-1 sm:ml-2"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart Button */}
              {cart.length > 0 && (
                <div className="mt-6 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearCart}
                    className="bg-red-900/50 border border-red-700/50 text-red-300 hover:bg-red-900/80 hover:text-red-200 rounded-lg px-4 py-2"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Сагс цэвэрлэх
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg lg:sticky lg:top-24">
                <h2 className="text-xl font-semibold mb-6 text-neutral-100">Захиалгын дэлгэрэнгүй</h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-neutral-300">
                    <span>Барааны нийт дүн ({itemCount}):</span>
                    <span className="font-medium text-neutral-100">{subtotal.toLocaleString()}₮</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Үйлчилгээний төлбөр (15%):</span>
                    <span className="font-medium text-neutral-100">{commission.toLocaleString()}₮</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Хүргэлтийн төлбөр:</span>
                    <span className="font-medium text-neutral-100">{deliveryFee.toLocaleString()}₮</span>
                  </div>
                </div>

                <Separator className="bg-neutral-700/50 mb-6" />

                {/* Total Amount */}
                <div className="flex justify-between text-lg font-semibold mb-8 text-neutral-100">
                  <span>Нийт төлөх дүн:</span>
                  <span>{total.toLocaleString()}₮</span>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full bg-white text-black hover:bg-neutral-100 rounded-full py-4 text-sm sm:py-5 sm:text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Төлбөр хийх
                </Button>
                {!user && cart.length > 0 && (
                  <p className="text-xs text-center text-neutral-400 mt-4">
                    Төлбөр хийхийн тулд эхлээд нэвтэрнэ үү.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        body {
          background-color: black;
        }
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          animation-fill-mode: both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          animation-fill-mode: both;
        }
        /* Improve font rendering */
        body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}