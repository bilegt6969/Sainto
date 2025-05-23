'use client';

import { useState, useEffect, useCallback } from 'react';
import useCartStore from '../../store/cartStore'; // Assuming this path is correct
import useOrderStore from '../orderStore'; // Assuming this path is correct
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    // Banknote, // FIX 1: Removed unused import
    CheckCircle,
    ShoppingBag,
    Info,
    Copy,
    Check,
    Home,
    // CreditCard, // FIX 2: Removed unused import
    Landmark // Used for bank details title
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming this path is correct
import { toast } from 'sonner';
import { Input } from '@/components/ui/input'; // Assuming this path is correct
import { Textarea } from '@/components/ui/textarea'; // Assuming this path is correct
import { Label } from '@/components/ui/label'; // Assuming this path is correct
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming this path is correct
import { Badge } from '@/components/ui/badge'; // Assuming this path is correct
import { Separator } from '@/components/ui/separator'; // Assuming this path is correct
// Select imports removed as it's replaced by button cards
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
const bankAccounts: Record<BankAccountKey, { number: string; name: string; recipient: string; logo?: string }> = {
    // Optional: Add logo URLs if you have them
    'KhanBank': { number: '5007123456', name: 'ХААН Банк', recipient: 'Цүүфү Онлайн Шоп ХХК' /*, logo: '/logos/khanbank.png' */ },
    'TDB': { number: '499123456', name: 'Худалдаа Хөгжлийн Банк', recipient: 'Цүүфү Онлайн Шоп ХХК' /*, logo: '/logos/tdb.png' */ },
    'StateBank': { number: '320123456', name: 'Төрийн Банк', recipient: 'Цүүфү Онлайн Шоп ХХК' /*, logo: '/logos/statebank.png' */ },
    'MBank': { number: '456123456', name: 'МБанк (Мобиком)', recipient: 'Цүүфү Онлайн Шоп ХХК' /*, logo: '/logos/mbank.png' */ },
    'GolomtBank': { number: '701123456', name: 'Голомт Банк', recipient: 'Цүүфү Онлайн Шоп ХХК' /*, logo: '/logos/golomt.png' */ },
};

export default function PaymentPage() {
    const { cart, clearCart } = useCartStore();
    const router = useRouter();
    const { transferCode, setTransferCode, setOrderNumber, orderNumber } = useOrderStore(); // Added orderNumber
    const [paymentMethod, setPaymentMethod] = useState<BankAccountKey | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
    const [currentDateTime, setCurrentDateTime] = useState(''); // For receipt timestamp
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [infoToastShown, setInfoToastShown] = useState(false); // State for Info Toast

    // Get current date/time for receipt
    useEffect(() => {
        setCurrentDateTime(new Date().toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, []); // Runs once on mount

    // Generate unique codes on mount if cart is not empty
    useEffect(() => {
        if (cart.length > 0 && !transferCode) {
            const productPrefix = cart[0].product.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const code = `${productPrefix}${randomNum}`;
            setTransferCode(code);
            const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
            setOrderNumber(orderNum);
        }
    }, [cart, setTransferCode, setOrderNumber, transferCode]); // Keep dependencies

    // Show payment method info toast when entering step 2
    useEffect(() => {
        if (step === 2 && !infoToastShown) {
            toast.info('Уучлаарай, бид төлбөрийн системтэй хараахан холбогдоогүй байна. Төлбөрөө заавал шилжүүлгээр хийгээрэй.', {
                icon: <Info className="h-5 w-5 text-blue-300" />,
                style: {
                    background: '#1e40af', // Dark blue background for info
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                },
                duration: 8000, // Keep it visible a bit longer
            });
            setInfoToastShown(true); // Mark as shown
        }
        // Reset the flag if the user goes back to step 1
        if (step === 1) {
            setInfoToastShown(false);
        }
    }, [step, infoToastShown]); // Add infoToastShown to dependencies

    // Calculate total cart price
    const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Helper to show warning toasts
    const showToastWarning = (message: string) => {
        toast.warning(message, {
            style: {
                background: '#f97316', // Orange background for warning
                color: 'white',
                border: 'none',
                borderRadius: '12px',
            },
        });
    };

    // Validation function (primarily for final check)
    const validateShippingInfo = (): boolean => {
        if (!formData.name.trim() || !/^[\u0400-\u04FF\s]+$/.test(formData.name.trim())) return false;
        if (!formData.phone.trim() || !/^\d{8}$/.test(formData.phone.trim())) return false;
        if (formData.email.trim() && !/^[^\s@]+@gmail\.com$/i.test(formData.email.trim())) return false;
        if (!formData.address.trim()) return false;
        return true;
    };

    // Handle transition from Step 1 to Step 2 with validation and specific toasts
    const handleContinueToPayment = () => {
        console.log("Үргэлжлүүлэх clicked, validating:", formData);
        if (!formData.name.trim()) { showToastWarning('Нэрээ оруулна уу.'); return; }
        if (!/^[\u0400-\u04FF\s]+$/.test(formData.name.trim())) { showToastWarning('Та нэрээ заавал кирилл үсгээр бичих ёстой.'); return; }
        if (!formData.phone.trim() || !/^\d{8}$/.test(formData.phone.trim())) { showToastWarning('Утасны дугаараа бүрэн оруулна уу (яг 8 оронтой тоо).'); return; }
        if (formData.email.trim() && !/^[^\s@]+@gmail\.com$/i.test(formData.email.trim())) { showToastWarning('И-мэйл хаягаа зөв оруулна уу (@gmail.com хаяг байх ёстой).'); return; }
        if (!formData.address.trim()) { showToastWarning('Хүргэлтийн хаягаа оруулна уу.'); return; }

        console.log("Validation passed, moving to step 2");
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle final form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateShippingInfo()) {
            showToastWarning('Хүргэлтийн мэдээлэл дутуу эсвэл алдаатай байна.');
            setStep(1); // Go back to step 1 if validation fails here
            return;
        }
        if (!paymentMethod) {
            showToastWarning('Төлбөрийн хэрэгсэл сонгоно уу.');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log("Submitting Order:", {
                shippingInfo: formData,
                paymentMethod,
                bankDetails: bankAccounts[paymentMethod],
                transferCode,
                orderNumber,
                items: cart,
                total,
            });

            // ---!!! Replace with your actual API call !!!---
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
            // --- End of Simulation ---

            toast.success(`Захиалга #${orderNumber} амжилттай! Гүйлгээний утга: ${transferCode}. Төлбөрөө шилжүүлнэ үү.`, {
                style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px' },
                duration: 10000,
            });
            clearCart();
            router.push('/payment-success'); // Ensure this route exists

        // FIX 3: Use unknown and check error type
        } catch (error: unknown) {
            console.error("Order submission error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Дахин оролдоно уу.';
            toast.error(`Захиалга илгээхэд алдаа гарлаа: ${errorMessage}`, {
                style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px' },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Empty Cart View ---
    if (cart.length === 0 && !isSubmitting) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-neutral-100">
                <div className="max-w-md w-full text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 mb-6 border border-neutral-800">
                        <ShoppingBag className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h2 className="text-3xl font-semibold text-neutral-100 mb-3">Таны сагс хоосон байна</h2>
                    <p className="text-neutral-400 mb-10 text-lg">Захиалга хийхийн тулд эхлээд хүссэн бараагаа сагсандаа нэмнэ үү.</p>
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

    // --- Progress Indicator ---
    const ProgressIndicator = () => (
        <div className="mb-10 flex flex-col items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Step Bubbles */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'} font-semibold transition-colors duration-300`}>
                    1
                </div>
                <div className={`w-16 sm:w-24 h-0.5 ${step >= 2 ? 'bg-white' : 'bg-neutral-800'} transition-colors duration-300`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'} font-semibold transition-colors duration-300`}>
                    2
                </div>
            </div>
            {/* Step Labels */}
            <div className="flex text-xs text-neutral-400 mt-2 w-full justify-center items-center px-4" style={{ maxWidth: 'calc(32px * 2 + 96px * 1 + 16px)' }}>
                <span className={`w-1/2 text-center pr-4 ${step >= 1 ? 'text-neutral-100 font-medium' : ''}`}>Хүргэлт</span>
                <span className={`w-1/2 text-center pl-4 ${step >= 2 ? 'text-neutral-100 font-medium' : ''}`}>Төлбөр</span>
            </div>
        </div>
    );

    // --- Component Render ---
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
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
                                    {/* --- Shipping Information Card --- */}
                                    <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                                        <CardHeader className="pb-4 border-b border-neutral-800">
                                            <CardTitle className="text-xl font-medium text-neutral-100">Хүргэлтийн мэдээлэл</CardTitle>
                                            <CardDescription className="text-neutral-400">Барааг хүлээн авах хүний мэдээллийг үнэн зөв оруулна уу.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            {/* Name, Phone */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-neutral-400 font-medium">Нэр<span className="text-red-500">*</span></Label>
                                                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required autoComplete="name" aria-required="true" className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12" placeholder="Кириллээр бичнэ үү" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-neutral-400 font-medium">Утасны дугаар<span className="text-red-500">*</span></Label>
                                                    <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required autoComplete="tel" aria-required="true" maxLength={8} className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12" placeholder="8 оронтой дугаар" />
                                                </div>
                                            </div>
                                            {/* Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-neutral-400 font-medium">И-мэйл (заавал биш, @gmail.com)</Label>
                                                <Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} autoComplete="email" className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12" placeholder="yourname@gmail.com" />
                                            </div>
                                            {/* Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-neutral-400 font-medium">Хүргэлтийн дэлгэрэнгүй хаяг<span className="text-red-500">*</span></Label>
                                                <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required rows={4} aria-required="true" placeholder="Дүүрэг, хороо, байр/гудамж, тоот..." className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500" />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-neutral-900/50 border-t border-neutral-800 pt-4 flex justify-end">
                                            {/* This button triggers handleContinueToPayment which includes the warnings */}
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
                                    {/* --- V2: Payment Method --- */}
                                    <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                                        <CardHeader className="pb-4 border-b border-neutral-800">
                                            <CardTitle className="text-xl font-medium text-neutral-100">Төлбөрийн хэрэгсэл сонгох</CardTitle>
                                            <CardDescription className="text-neutral-400">Төлбөрөө доорх данснуудын аль нэг рүү шилжүүлж, гүйлгээний утгад кодыг бичээд захиалгаа баталгаажуулна уу.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            {/* --- NEW: Bank Selection Cards --- */}
                                            <div>
                                                <Label className="text-neutral-400 font-medium mb-3 block">Шилжүүлэх Банк<span className="text-red-500">*</span></Label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                                    {/* FIX 4: Removed unused 'logo' from destructuring */}
                                                    {Object.entries(bankAccounts).map(([key, { name }]) => {
                                                        const isSelected = paymentMethod === key;
                                                        return (
                                                            <button
                                                                type="button" // Make it a button for accessibility
                                                                key={key}
                                                                onClick={() => handlePaymentMethodSelect(key as BankAccountKey)}
                                                                className={`relative p-4 h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl border-2 text-center transition-all duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${isSelected ? 'bg-blue-950/30 border-blue-600 ring-2 ring-blue-600 ring-offset-1 ring-offset-neutral-900' : 'bg-neutral-800 border-neutral-700 hover:border-neutral-500 hover:bg-neutral-700/50'}`}
                                                                aria-pressed={isSelected} // Aria attribute for selection state
                                                            >
                                                                {/* Optional: Add Logo */}
                                                                {/* {logo && <img src={logo} alt={`${name} logo`} className="h-6 mb-1.5"/>} */}
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
                                            {/* --- V2: Bank Details Section --- */}
                                            {paymentMethod && bankAccounts[paymentMethod] && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginTop: '24px' }} // Animate height and margin
                                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                                    className="bg-gradient-to-br from-indigo-950/70 via-neutral-900 to-neutral-900 border border-indigo-800/40 p-5 sm:p-6 rounded-2xl shadow-lg overflow-hidden" // Slightly different gradient/border
                                                >
                                                    <h3 className="font-medium text-indigo-300 mb-4 flex items-center gap-2 text-lg">
                                                        <Landmark className="h-5 w-5 flex-shrink-0 text-indigo-400" /> {/* Changed Icon */}
                                                        Төлбөр хүлээн авагч
                                                    </h3>
                                                    {/* Improved Layout for Details */}
                                                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm sm:text-base text-indigo-100 mb-5">
                                                        <dt className="font-medium text-indigo-300/90">Банк:</dt>
                                                        <dd className="text-indigo-100">{bankAccounts[paymentMethod].name}</dd>

                                                        <dt className="font-medium text-indigo-300/90 self-start pt-1">Данс:</dt>
                                                        <dd className="font-mono text-indigo-50 text-lg sm:text-xl tracking-wider bg-indigo-900/50 px-3 py-1 rounded-md w-fit"> {/* Highlighted Account */}
                                                            {bankAccounts[paymentMethod].number}
                                                        </dd>

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
                                                        <p>
                                                            <Info className="inline-block h-4 w-4 mr-1.5 align-text-bottom text-indigo-300" />
                                                            <span className='font-semibold'>Анхаар:</span> Шилжүүлэг хийхдээ <strong className='text-indigo-100'>Гүйлгээний утга</strong> хэсэгт дээрх <code className='font-bold text-indigo-100 bg-indigo-900/70 px-1.5 py-0.5 rounded mx-1'>{transferCode}</code> кодыг <span className='underline decoration-wavy decoration-indigo-400/80'>ЗААВАЛ ОРУУЛНА УУ</span>. Энэ кодоор таны төлбөрийг баталгаажуулна.
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="bg-neutral-900/50 border-t border-neutral-800 pt-4 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={!paymentMethod || isSubmitting || cart.length === 0 || !transferCode}
                                                className="w-full py-6 text-base font-medium bg-white hover:bg-neutral-100 text-black disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-full transition-all" // Added transition
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-400"></div>
                                                        Илгээж байна...
                                                    </span>
                                                ) : (
                                                    'Захиалга баталгаажуулах'
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Order Summary (Receipt Style) */}
                    <div className="lg:col-span-1">
                         <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }} // Slight delay
                        >
                            {/* Light background card for receipt effect */}
                            <Card className="bg-white border border-neutral-200 shadow-md rounded-lg sticky top-24 text-neutral-900 overflow-hidden">
                                <CardHeader className="pb-4 border-b border-neutral-200 bg-neutral-50/50">
                                    {/* Dark text for title */}
                                    <CardTitle className="text-lg font-semibold text-neutral-800">Захиалгын баримт</CardTitle>
                                    {orderNumber && (
                                        <CardDescription className="text-neutral-600 text-sm pt-1">
                                            Захиалгын №: <span className="font-medium text-neutral-700">{orderNumber}</span>
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-5 p-5">
                                    {/* Item list with light theme styling */}
                                    <div className="space-y-4 max-h-72 overflow-y-auto pr-3 -mr-1 styled-scrollbar-light">
                                        {cart.map((item: CartItem, index: number) => (
                                            <div key={`${item.product.name}-${item.size}-${index}`} className="flex gap-3 items-start">
                                                {/* Image */}
                                                <div className="relative w-14 h-14 rounded-md overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                                                    {item.product.image_url ? (
                                                        <Image
                                                            src={item.product.image_url}
                                                            alt={item.product.name}
                                                            fill
                                                            sizes="56px"
                                                            className="object-cover"
                                                            loading='lazy'
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-neutral-400">
                                                            <ShoppingBag className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-[13px] text-neutral-800 leading-snug" title={item.product.name}>
                                                        {item.product.name}
                                                    </h3>
                                                    <div className="flex gap-2 mt-1 flex-wrap">
                                                        {item.size && (
                                                             <Badge variant="outline" className="text-[11px] font-normal border-neutral-300 text-neutral-600 rounded px-1.5 py-0">{item.size}</Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-[11px] font-normal border-neutral-300 text-neutral-600 rounded px-1.5 py-0">x{item.quantity}</Badge>
                                                    </div>
                                                </div>
                                                {/* Price */}
                                                <p className="font-medium text-sm text-neutral-900 mt-0.5 font-mono text-right flex-shrink-0 ml-2">
                                                    {(item.price * item.quantity).toLocaleString()}₮
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Totals section with receipt styling */}
                                    <div className="pt-4 mt-2">
                                        <div className="border-t border-dashed border-neutral-300 mb-4"></div>
                                        <div className="space-y-1.5 text-sm text-neutral-600">
                                            <div className="flex justify-between font-mono">
                                                <span>Бүтээгдэхүүн:</span>
                                                <span className='text-neutral-800'>{total.toLocaleString()}₮</span>
                                            </div>
                                            <div className="flex justify-between font-mono">
                                                <span>Хүргэлт:</span>
                                                <span className='text-neutral-800'>0₮</span> {/* Assuming free delivery */}
                                            </div>
                                        </div>
                                        <Separator className="my-3 bg-neutral-300 h-[1px]" />
                                        <div className="flex justify-between text-base font-semibold text-neutral-900">
                                            <span className="font-bold">Нийт дүн:</span>
                                            <span className='text-lg font-bold font-mono'>{total.toLocaleString()}₮</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 pb-3 px-5 border-t border-neutral-200 bg-neutral-50/50">
                                    <p className="text-[11px] text-neutral-500 text-center w-full font-mono">{currentDateTime}</p>
                                </CardFooter>
                            </Card>
                         </motion.div>
                    </div>
                </form>
            </div>

            {/* Custom scrollbar styling */}
            <style jsx global>{`
                /* Dark scrollbar */
                .styled-scrollbar::-webkit-scrollbar { width: 6px; }
                .styled-scrollbar::-webkit-scrollbar-track { background: rgba(38, 38, 38, 0.5); border-radius: 10px; }
                .styled-scrollbar::-webkit-scrollbar-thumb { background-color: #525252; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                .styled-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #737373; }
                .styled-scrollbar { scrollbar-width: thin; scrollbar-color: #525252 rgba(38, 38, 38, 0.5); }

                /* Light scrollbar (for the receipt card) */
                .styled-scrollbar-light::-webkit-scrollbar { width: 6px; }
                .styled-scrollbar-light::-webkit-scrollbar-track { background: rgba(229, 231, 235, 0.5); border-radius: 10px; margin-top: 4px; margin-bottom: 4px; }
                .styled-scrollbar-light::-webkit-scrollbar-thumb { background-color: #a3a3a3; border-radius: 10px; border: 1px solid transparent; background-clip: content-box; }
                .styled-scrollbar-light::-webkit-scrollbar-thumb:hover { background-color: #737373; }
                .styled-scrollbar-light { scrollbar-width: thin; scrollbar-color: #a3a3a3 rgba(229, 231, 235, 0.5); }
            `}</style>
        </div>
    );
}