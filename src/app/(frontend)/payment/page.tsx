'use client';

import { useState, useEffect, useCallback } from 'react';
import useCartStore from '../../store/cartStore'; // Assuming this path is correct
import useOrderStore from '../orderStore'; // Assuming this path is correct
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, ShoppingBag, Info, Copy, Check, Home, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming this path is correct
import { toast } from 'sonner'; // Using Sonner for toasts
import { Input } from '@/components/ui/input'; // Assuming this path is correct
import { Textarea } from '@/components/ui/textarea'; // Assuming this path is correct
import { Label } from '@/components/ui/label'; // Assuming this path is correct
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Assuming this path is correct
 import { Separator } from '@/components/ui/separator'; // Assuming this path is correct
import { AnimatePresence, motion } from 'framer-motion';

// Interfaces
interface CartItem {
  product: {
    name: string;
    image_url?: string;
  };
  size: string;
  quantity: number;
  price: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

type BankAccountKey = 'KhanBank' | 'TDB' | 'StateBank' | 'MBank' | 'GolomtBank';

// Bank Account Details
const bankAccounts: Record<
  BankAccountKey,
  { number: string; name: string; recipient: string; logo?: string }
> = {
  KhanBank: {
    number: '5007123456',
    name: 'ХААН Банк',
    recipient: 'Цүүфү Онлайн Шоп ХХК',
  },
  TDB: {
    number: '499123456',
    name: 'Худалдаа Хөгжлийн Банк',
    recipient: 'Цүүфү Онлайн Шоп ХХК',
  },
  StateBank: {
    number: '320123456',
    name: 'Төрийн Банк',
    recipient: 'Цүүфү Онлайн Шоп ХХК',
  },
  MBank: {
    number: '456123456',
    name: 'МБанк (Мобиком)',
    recipient: 'Цүүфү Онлайн Шоп ХХК',
  },
  GolomtBank: {
    number: '701123456',
    name: 'Голомт Банк',
    recipient: 'Цүүфү Онлайн Шоп ХХК',
  },
};

export default function PaymentPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();
  const { transferCode, setTransferCode, setOrderNumber, orderNumber } = useOrderStore();

  const [paymentMethod, setPaymentMethod] = useState<BankAccountKey | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [infoToastShown, setInfoToastShown] = useState(false);

  // Get current date/time for receipt
  useEffect(() => {
    setCurrentDateTime(
      new Date().toLocaleString('mn-MN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }, []);

  // Generate unique codes on mount if cart is not empty
  useEffect(() => {
    if (cart.length > 0 && !transferCode) {
      const productPrefix = cart[0].product.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const code = `${productPrefix}${randomNum}`;
      setTransferCode(code);
      const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);
    }
  }, [cart, setTransferCode, setOrderNumber, transferCode]);

  // Show payment method info toast when entering step 2
  useEffect(() => {
    if (step === 2 && !infoToastShown) {
      toast.info(
        'Уучлаарай, бид төлбөрийн системтэй хараахан холбогдоогүй байна. Төлбөрөө заавал шилжүүлгээр хийгээрэй.',
        {
          icon: <Info className="h-5 w-5 text-blue-300" />,
          style: {
            background: '#1e40af', // Tailwind blue-800
            color: 'white',
            border: 'none',
            borderRadius: '12px',
          },
          duration: 8000,
        }
      );
      setInfoToastShown(true);
    }
    if (step === 1) {
      setInfoToastShown(false); // Reset when going back to step 1
    }
  }, [step, infoToastShown]);

  // Calculate total cart price
  const total = cart.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle bank selection via cards
  const handlePaymentMethodSelect = (key: BankAccountKey) => {
    setPaymentMethod(key);
  };

  // Handle copying the transfer code
  const handleCopyCode = useCallback(async () => {
    if (!transferCode) return;
    try {
      await navigator.clipboard.writeText(transferCode);
      setIsCopied(true);
      toast.success("Гүйлгээний утга хуулагдлаа!", {
        style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px' },
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Хуулж чадсангүй. Та өөрөө хуулна уу.", {
        style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px' },
      });
      console.error('Failed to copy text:', err);
    }
  }, [transferCode]);

  // Helper to show warning toasts (already existed, kept for consistency if needed elsewhere)
 

  // Helper to show error toasts using Sonner
  const showToastError = (message: string) => {
    toast.error(message, {
      style: {
        background: '#ef4444', // Tailwind red-500
        color: 'white',
        border: 'none',
        borderRadius: '12px',
      },
    });
  };


  // Validation helper functions
  const isCyrillicName = (name: string): boolean => {
    // Cyrillic range includes Mongolian Cyrillic characters
    // Allows spaces between names
    const cyrillicRegex = /^[\u0400-\u04FF\u0500-\u052F\s]+$/;
    return cyrillicRegex.test(name.trim());
  };

  const isValidEmail = (email: string): boolean => {
    // More comprehensive email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isValidPhone = (phone: string): boolean => {
    // Exactly 8 digits
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(phone.trim());
  };


  // Comprehensive validation function
  const validateShippingInfo = (): boolean => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();

    // Name validation
    if (!trimmedName) {
      showToastError('Нэрээ оруулна уу.');
      return false;
    }
    if (!isCyrillicName(trimmedName)) {
      showToastError('Нэрээ заавал кирилл үсгээр бичнэ үү.');
      return false;
    }

    // Phone validation
    if (!trimmedPhone) {
      showToastError('Утасны дугаараа оруулна уу.');
      return false;
    }
    if (!isValidPhone(trimmedPhone)) {
      showToastError('Утасны дугаараа зөв оруулна уу (яг 8 оронтой тоо).');
      return false;
    }
    
    // Email validation (now required)
    if (!trimmedEmail) {
      showToastError('И-мэйл хаягаа оруулна уу.');
      return false;
    }
    if (!isValidEmail(trimmedEmail)) {
      showToastError('И-мэйл хаягаа зөв оруулна уу.');
      return false;
    }

    // Address validation
    if (!trimmedAddress) {
      showToastError('Хүргэлтийн хаягаа оруулна уу.');
      return false;
    }

    return true;
  };

  // Handle transition from Step 1 to Step 2 with validation
  const handleContinueToPayment = () => {
    console.log("Үргэлжлүүлэх clicked, validating:", formData);
    if (validateShippingInfo()) {
        console.log("Validation passed, moving to step 2");
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  // Handle final form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateShippingInfo()) {
        setStep(1); // Go back to step 1 if validation fails on submit (e.g., user bypassed button)
        return;
    }

    if (!paymentMethod) {
      showToastError('Төлбөрийн хэрэгсэл сонгоно уу.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      console.log("Submitting Order:", {
        shippingInfo: formData,
        paymentMethod,
        bankDetails: bankAccounts[paymentMethod],
        transferCode,
        orderNumber,
        items: cart,
        total,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      toast.success(
        `Захиалга #${orderNumber} амжилттай! Гүйлгээний утга: ${transferCode}. Төлбөрөө шилжүүлнэ үү.`,
        {
          style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px' },
          duration: 10000,
        }
      );
      clearCart();
      router.push('/payment-success'); // Redirect to a success page
    } catch (error: unknown) {
      console.error("Order submission error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Дахин оролдоно уу.';
      showToastError(`Захиалга илгээхэд алдаа гарлаа: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty Cart View
  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 mb-6 border border-neutral-800">
            <ShoppingBag className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-semibold text-neutral-100 mb-3">
            Таны сагс хоосон байна
          </h2>
          <p className="text-neutral-400 mb-10 text-lg">
            Захиалга хийхийн тулд эхлээд хүссэн бараагаа сагсандаа нэмнэ үү.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white hover:bg-neutral-100 text-black font-medium px-8 py-6 rounded-full">
              <Home className="mr-2 h-4 w-4" />
              Дэлгүүр лүү буцах
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Progress Indicator
  const ProgressIndicator = () => (
    <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'} font-semibold transition-colors duration-300`}>1</div>
            <div className={`w-16 sm:w-24 h-0.5 ${step >= 2 ? 'bg-white' : 'bg-neutral-800'} transition-colors duration-300`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'} font-semibold transition-colors duration-300`}>2</div>
        </div>
        <div className="flex text-xs text-neutral-400 mt-2 w-full justify-center items-center px-4" style={{maxWidth: 'calc(32px * 2 + 96px * 1 + 16px)'}}>
            <span className={`w-1/2 text-center pr-4 ${step >=1 ? 'text-neutral-100 font-medium': ''}`}>Хүргэлт</span>
            <span className={`w-1/2 text-center pl-4 ${step >=2 ? 'text-neutral-100 font-medium': ''}`}>Төлбөр</span>
        </div>
    </div>
  );


  // Component Render
  return (
    <div className="min-h-screen rounded-[2rem] border border-neutral-700 bg-neutral-950 text-neutral-100 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
          <Button
              variant="ghost"
              onClick={() => step === 1 ? router.back() : setStep(1)}
              className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 px-0 hover:bg-transparent"
              aria-label="Go back"
          >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? 'Буцах' : 'Хүргэлтийн мэдээлэл рүү буцах'}
          </Button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-neutral-100 mb-4 text-center">
          {step === 1 ? 'Хүргэлтийн мэдээлэл' : 'Төлбөрийн хэлбэр'}
        </h1>
        <ProgressIndicator />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Shipping Information Card */}
                  <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-neutral-800">
                      <CardTitle className="text-xl font-medium text-neutral-100">Хүргэлтийн мэдээлэл</CardTitle>
                      <CardDescription className="text-neutral-400">Барааг хүлээн авах хүний мэдээллийг үнэн зөв оруулна уу.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {/* Name, Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-neutral-400 font-medium">
                            Нэр<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            autoComplete="name"
                            aria-required="true"
                            className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                            placeholder="Кириллээр бичнэ үү"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-neutral-400 font-medium">
                            Утасны дугаар<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            autoComplete="tel"
                            aria-required="true"
                            maxLength={8}
                            className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                            placeholder="8 оронтой дугаар"
                          />
                        </div>
                      </div>
                      {/* Email - Now Required */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-neutral-400 font-medium">
                          И-мэйл хаяг<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required // Made email required
                          autoComplete="email"
                          className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12"
                          placeholder="yourname@example.com"
                        />
                      </div>
                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-neutral-400 font-medium">
                          Хүргэлтийн дэлгэрэнгүй хаяг<span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          aria-required="true"
                          placeholder="Дүүрэг, хороо, байр/гудамж, тоот..."
                          className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="bg-neutral-900/50 border-t border-neutral-800 pt-4 flex justify-end">
                        <Button type="button" onClick={handleContinueToPayment} className="w-full sm:w-auto py-6 px-8 text-base font-medium bg-white hover:bg-neutral-100 text-black rounded-full">
                            Төлбөр рүү үргэлжлүүлэх
                        </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Payment Method Card */}
                  <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-neutral-800">
                        <CardTitle className="text-xl font-medium text-neutral-100">Төлбөрийн хэрэгсэл сонгох</CardTitle>
                        <CardDescription className="text-neutral-400">Төлбөрөө доорх данснуудын аль нэг рүү шилжүүлж, гүйлгээний утгад кодыг бичээд захиалгаа баталгаажуулна уу.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Bank Selection Cards */}
                        <div>
                            <Label className="text-neutral-400 font-medium mb-3 block">Шилжүүлэх Банк<span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                {Object.entries(bankAccounts).map(([key, { name }]) => {
                                    const isSelected = paymentMethod === key;
                                    return (
                                        <button
                                            type="button"
                                            key={key}
                                            onClick={() => handlePaymentMethodSelect(key as BankAccountKey)}
                                            className={`relative p-4 h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl border-2 text-center transition-all duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                                                isSelected
                                                    ? 'bg-blue-950/30 border-blue-600 ring-2 ring-blue-600 ring-offset-1 ring-offset-neutral-900'
                                                    : 'bg-neutral-800 border-neutral-700 hover:border-neutral-500 hover:bg-neutral-700/50'
                                            }`}
                                            aria-pressed={isSelected}
                                        >
                                            <span className={`font-medium text-xs sm:text-sm ${isSelected ? 'text-blue-100' : 'text-neutral-200'}`}>{name}</span>
                                            {isSelected && (
                                                <div className="absolute top-1.5 right-1.5 text-blue-400">
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        {paymentMethod && bankAccounts[paymentMethod] && (
                             <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: '24px' }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="bg-gradient-to-br from-indigo-950/70 via-neutral-900 to-neutral-900 border border-indigo-800/40 p-5 sm:p-6 rounded-2xl shadow-lg overflow-hidden"
                            >
                                <h3 className="font-medium text-indigo-300 mb-4 flex items-center gap-2 text-lg">
                                    <Landmark className="h-5 w-5 flex-shrink-0 text-indigo-400"/>
                                    Төлбөр хүлээн авагч
                                </h3>
                                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm sm:text-base text-indigo-100 mb-5">
                                    <dt className="font-medium text-indigo-300/90">Банк:</dt>
                                    <dd className="text-indigo-100">{bankAccounts[paymentMethod].name}</dd>
                                    <dt className="font-medium text-indigo-300/90 self-start pt-1">Данс:</dt>
                                    <dd className="font-mono text-indigo-50 text-lg sm:text-xl tracking-wider bg-indigo-900/50 px-3 py-1 rounded-md w-fit">{bankAccounts[paymentMethod].number}</dd>
                                    <dt className="font-medium text-indigo-300/90">Хүлээн авагч:</dt>
                                    <dd className="text-indigo-100">{bankAccounts[paymentMethod].recipient}</dd>
                                </dl>

                                <Separator className="my-5 bg-indigo-800/30" />

                                {/* Transfer Code Section */}
                                <div>
                                    <span className="font-medium text-indigo-300/90 block mb-2 text-sm sm:text-base">Гүйлгээний утга (Заавал хуулж бичнэ үү):</span>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-indigo-900/60 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-xl border border-indigo-700/50 w-fit">
                                        <span className="font-bold text-indigo-50 text-xl sm:text-2xl tracking-widest">{transferCode}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 p-0 text-indigo-300 hover:bg-indigo-700/70 hover:text-indigo-100 rounded-full"
                                            onClick={handleCopyCode}
                                            aria-label="Copy transfer code"
                                            disabled={!transferCode}
                                        >
                                            {isCopied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Important Note */}
                                <div className="text-xs sm:text-sm text-indigo-200/90 pt-4 mt-4 bg-indigo-950/40 p-3 sm:p-4 rounded-xl border border-indigo-800/30">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-300" />
                                        <p>
                                            <span className="font-medium text-indigo-100">Анхаарах зүйл:</span> Төлбөр хийсний дараа захиалгын дугаар <span className="font-bold">{orderNumber}</span> болон гүйлгээний утга <span className="font-mono font-bold">{transferCode}</span> зөв бичсэн эсэхийг шалгана уу. Төлбөр хийгдэх хүртэл захиалга хүчинтэй байх хугацаа 24 цаг.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24"> {/* Adjust top value as needed for your header height */}
              <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-neutral-800">
                  <CardTitle className="text-xl font-medium text-neutral-100">Захиалгын дэлгэрэнгүй</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item: CartItem) => (
                      <div key={`${item.product.name}-${item.size}`} className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700">
                                {item.product.image_url ? (
                                    <Image
                                    src={item.product.image_url}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    />
                                ) : (
                                    <ShoppingBag className="h-5 w-5 text-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-100 line-clamp-1">{item.product.name}</p>
                                <p className="text-xs text-neutral-400">Хэмжээ: {item.size} × {item.quantity}</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-neutral-100">{(item.price * item.quantity).toLocaleString()}₮</p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between text-neutral-300">
                      <span>Барааны нийт дүн:</span>
                      <span className="font-medium text-neutral-100">{total.toLocaleString()}₮</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Хүргэлтийн төлбөр:</span>
                      <span className="font-medium text-neutral-100">5,000₮</span> {/* Assuming fixed delivery fee */}
                    </div>
                  </div>

                  <Separator className="bg-neutral-700/50 mb-6" />

                  {/* Total Amount */}
                  <div className="flex justify-between text-lg font-semibold mb-6 text-neutral-100">
                    <span>Нийт төлөх дүн:</span>
                    <span>{(total + 5000).toLocaleString()}₮</span>
                  </div>
                  
                  {/* Order Info */}
                  <div className="text-xs text-neutral-400 space-y-2">
                      <p>Захиалгын дугаар: <span className="font-mono text-neutral-300">{orderNumber}</span></p>
                      <p>Огноо: <span className="text-neutral-300">{currentDateTime}</span></p>
                  </div>
                </CardContent>
                <CardFooter className="bg-neutral-900/50 border-t border-neutral-800 pt-4">
                    {step === 1 ? (
                         <Button type="button" onClick={handleContinueToPayment} className="w-full py-6 text-base font-medium bg-white hover:bg-neutral-100 text-black rounded-full">
                            Төлбөр рүү үргэлжлүүлэх
                        </Button>
                    ) : (
                        <Button type="submit" disabled={!paymentMethod || isSubmitting} className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Баталгаажуулж байна...
                                </span>
                            ) : (
                                <span>Захиалга баталгаажуулах</span>
                            )}
                        </Button>
                    )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
