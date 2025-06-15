'use client';
import { useState, useEffect, useCallback } from 'react';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../orderStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, ShoppingBag, Info, Copy, Check, Home, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interfaces
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
interface FormData {
  name: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  address: string;
}

// --- MODIFIED SECTION START ---

// Updated bank account keys
type BankAccountKey = 'Account1';

// Location data for Mongolia (remains the same)
const mongolianLocations: Record<string, string[]> = {
    'Улаанбаатар': ['Баянзүрх дүүрэг','Хан-Уул дүүрэг','Баянгол дүүрэг','Чингэлтэй дүүрэг','Сүхбаатар дүүрэг','Сонгинохайрхан дүүрэg','Налайх дүүрэг','Багануур дүүрэг','Багахангай дүүрэг'],'Архангай':['Эрдэнэбулган сум','Батцэнгэл сум','Булган сум (Архангай)','Жаргалант сум (Архангай)','Ихтамир сум','Тариат сум','Хайрхан сум (Архангай)','Хотонт сум','Цахир сум','Цэцэрлэг сум (Архангай)','Чулуут сум','Өгийнуур сум','Өлзийт сум (Архангай)','Өндөр-Улаан сум','Эрдэнэмандал сум'],'Баян-Өлгий':['Өлгий сум','Алтай сум (Баян-Өлгий)','Алтанцөгц сум','Баяннуур сум (Баян-Өлгий)','Бугат сум (Баян-Өлгий)','Булган сум (Баян-Өлгий)','Дэлүүн сум','Ногооннуур сум','Сагсай сум','Толбо сум','Улаанхус сум','Цэнгэл сум'],'Баянхонгор':['Баянхонгор сум','Баацагаан сум','Баян-Овоо сум (Баянхонгор)','Баян-Өндөр сум (Баянхонгор)','Баянбулаг сум (Баянхонгор)','Баянговь сум','Баянлиг сум','Богд сум (Баянхонгор)','Бөмбөгөр сум','Бууцагаан сум','Галуут сум','Гурванбулаг сум (Баянхонгор)','Жаргалант сум (Баянхонгор)','Жинст сум','Заг сум','Хүрээмарал сум','Өлзийт сум (Баянхонгор)','Эрдэнэцогт сум'],'Булган':['Булган сум (Булган)','Баян-Агт сум','Баяннуур сум (Булган)','Бугат сум (Булган)','Бүрэгхангай сум','Гурванбулаг сум (Булган)','Дашинчилэн сум','Могод сум','Орхон сум (Булган)','Рашаант сум','Сайхан сум (Булган)','Сэлэнгэ сум (Булган)','Тэшиг сум','Хангал сум','Хишиг-Өндөр сум','Хутаг-Өндөр сум'],'Говь-Алтай':['Алтай сум (Говь-Алтай)','Баян-Уул сум (Говь-Алтай)','Бигэр сум','Бугат сум (Говь-Алтай)','Дарви сум (Говь-Алтай)','Дэлгэр сум (Говь-Алтай)','Есөнбулаг сум','Жаргалан сум (Говь-Алтай)','Тайшир сум','Тонхил сум','Төгрөг сум (Говь-Алтай)','Халиун сум','Хөхморьт сум','Цогт сум (Говь-Алтай)','Цээл сум (Говь-Алтай)','Чандмань сум (Говь-Алтай)','Шарга сум','Эрдэнэ сум (Говь-Алтай)'],'Говьсүмбэр':['Сүмбэр сум','Баянтал сум','Шивээговь сум'],'Дархан-Уул':['Дархан сум','Хонгор сум','Орхон сум (Дархан-Уул)','Шарынгол сум'],'Дорноговь':['Сайншанд сум','Айраг сум','Алтанширээ сум','Даланжаргалан сум','Дэлгэрэх сум','Замын-Үүд сум','Иххэт сум','Мандах сум (Дорноговь)','Өргөн сум','Сайхандулаан сум','Улаанбадрах сум','Хатанбулаг сум','Хөвсгөл сум (Дорноговь)','Эрдэнэ сум (Дорноговь)'],'Дорнод':['Чойбалсан сум','Баян-Уул сум (Дорнод)','Баянтүмэн сум','Баяндун сум','Булган сум (Дорнод)','Гурванзагал сум','Дашбалбар сум','Матад сум','Сэргэлэн сум (Дорнод)','Халхгол сум','Хөлөнбуйр сум','Цагаан-Овоо сум','Чулуунхороот сум'],'Дундговь':['Мандалговь сум','Адаацаг сум','Баянжаргалан сум (Дундговь)','Говь-Угтаал сум','Гурвансайхан сум (Дундговь)','Дэлгэрхангай сум','Дэлгэрцогт сум','Дэрэн сум','Луус сум','Өлзийт сум (Дундговь)','Өндөршил сум','Сайхан-Овоо сум','Сайханзайн сум (Дундговь)','Хулд сум','Цагаандэлгэр сум','Эрдэнэдалай сум'],'Завхан':['Улиастай сум','Алдархаан сум','Асгат сум (Завхан)','Баянтэс сум','Баянхайрхан сум (Завхан)','Дөрвөлжин сум (Завхан)','Завханмандал сум','Идэр сум','Их-Уул сум (Завхан)','Нөмрөг сум','Отгон сум','Сантмаргац сум','Сонгино сум (Завхан)','Тосонцэнгэл сум','Түдэвтэй сум','Тэлмэн сум','Ургамал сум','Цагаанхайрхан сум (Завхан)','Цагаанчулуут сум','Цэцэн-Уул сум','Шилүүстэй сум','Эрдэнэхайрхан сум (Завхан)','Яруу сум'],'Орхон':['Баян-Өндөр сум','Жаргалант сум (Орхон)'],'Өвөрхангай':['Арвайхээр сум','Баруунбаян-Улаан сум','Бат-Өлзий сум','Баян-Өндөр сум (Өвөрхангай)','Баянгол сум (Өвөрхангай)','Богд сум (Өвөрхангай)','Бүрд сум','Гучин-Ус сум','Долоонхошуу','Зүүнбаян-Улаан сум','Сант сум (Өвөрхангай)','Тарагт сум','Төгрөг сум (Өвөрхангай)','Уянга сум','Хархорин сум','Хайрхандулаан сум','Хужирт сум','Есөнзүйл сум'],'Өмнөговь':['Даланзадгад сум','Баяндалай сум','Баян-Овоо сум (Өмнөговь)','Булган сум (Өмнөговь)','Гурвантэс сум','Мандал-Овоо сум','Манлай сум','Ноён сум','Номгон сум','Сэврэй сум','Ханбогд сум','Ханхонгор сум','Хүрмэн сум','Цогт-Овоо сум','Цогтцэций сум'],'Сүхбаатар':['Баруун-Урт сум','Асгат сум (Сүхбаатар)','Баяндэлгэр сум (Сүхбаатар)','Дарьганга сум','Мөнххаан сум','Наран сум','Онгон сум','Сүхбаатар сум (Сүхбаатар)','Түмэнцогт сум','Түвшинширээ сум','Уулбаян сум','Халзан сум','Эрдэнэцагаан сум'],'Сэлэнгэ':['Сүхбаатар сум (Сэлэнгэ)','Алтанбулаг сум (Сэлэнгэ)','Баруунбүрэн сум','Баянгол сум (Сэлэнгэ)','Жавхлант сум (Сэлэнгэ)','Зүүнбүрэн сум','Мандал сум (Сэлэнгэ)','Орхон сум (Сэлэнгэ)','Орхонтуул сум','Сайхан сум (Сэлэнгэ)','Сант сум (Сэлэнгэ)','Түшиг сум','Хүдэр сум','Хушаат сум (Сэлэнгэ)','Цагааннуур сум (Сэлэнгэ)','Шаамар сум'],'Төв':['Зуунмод сум','Алтанбулаг сум (Төв)','Аргалант сум','Архуст сум','Батсүмбэр сум','Баян сум (Төв)','Баяндэлгэр сум (Төв)','Баянжаргалан сум (Төв)','Баян-Өнжүүл сум','Баянхангай сум','Баянцагаан сум (Төв)','Баянчандмань сум','Борнуур сум','Бүрэн сум (Төв)','Дэлгэрхаан сум (Төв)','Жаргалант сум (Төв)','Заамар сум','Лүн сум','Мөнгөнморьт сум','Өндөрширээт сум','Сэргэлэн сум (Төв)','Сүмбэр сум (Төв)','Угтаалцайдам сум','Цээл сум (Төв)','Эрдэнэ сум (Төв)','Эрдэнэсант сум'],'Увс':['Улаангом сум','Баруунтуруун сум','Бөхмөрөн сум','Давст сум','Завхан сум (Увс)','Зүүнговь сум','Зүүнхангай сум','Малчин сум','Наранбулаг сум','Өлгий сум (Увс)','Өмнөговь сум (Увс)','Сагил сум','Тариалан сум (Увс)','Тэс сум (Увс)','Түргэн сум','Ховд сум (Увс)','Хяргас сум','Цагаанхайрхан сум (Увс)','Чандмань сум (Увс)'],'Ховд':['Ховд сум (Ховд)','Алтай сум (Ховд)','Булган сум (Ховд)','Буянт сум (Ховд)','Дарви сум (Ховд)','Дөргөн сум','Дуут сум','Зэрэг сум','Манхан сум','Мөнххайрхан сум','Мөст сум','Мянгад сум','Үенч сум','Ховд сум (Ховд)','Цэцэг сум (Ховд)','Чандмань сум (Ховд)','Эрдэнэбүрэн сум'],'Хөвсгөл':['Мөрөн сум','Алаг-Эрдэнэ сум','Арбулаг сум','Баянзүрх сум (Хөвсгөл)','Бүрэнтогтох сум','Галт сум (Хөвсгөл)','Жаргалант сум (Хөвсгөл)','Их-Уул сум (Хөвсгөл)','Рашаант сум (Хөвсгөл)','Рэнчинлхүмбэ сум','Тариалан сум (Хөвсгөл)','Тосонцэнгэл сум (Хөвсгөл)','Төмөрбулаг сум','Түнэл сум','Улаан-Уул сум','Ханх сум','Цагааннуур сум (Хөвсгөл)','Цагаан-Уул сум','Цагаан-Үүр сум','Цэцэрлэг сум (Хөвсгөл)','Чандмань-Өндөр сум','Шинэ-Идэр сум','Эрдэнэбулган сум (Хөвсгөл)'],'Хэнтий':['Чингис хот (Өндөрхаан)','Батноров сум','Батширээт сум','Баян-Адрага сум','Баянмөнх сум (Хэнтий)','Баян-Овоо сум (Хэнтий)','Биндэр сум','Дадал сум','Дархан сум (Хэнтий)','Дэлгэрхаан сум (Хэнтий)','Жаргалтхаан сум','Мөрөн сум (Хэнтий)','Норовлин сум','Өмнөдэлгэр сум','Хэрлэнбаян-Улаан сум','Цэнхэрмандал сум'],
};

// Updated BankAccountDetails
const bankAccounts: Record<BankAccountKey, { number: string; name: string; recipient: string; logo?: string; IBAN?: string }> = {
  Account1: {
    number: '2205202046',
    IBAN: '28001500',
    name: 'Голомт Банк',
    recipient: 'Аззаяа Түвшинтөгс',
  }
  
};

// --- MODIFIED SECTION END ---

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
    province: '',
    district: '',
    address: '',
  });
  const [infoToastShown, setInfoToastShown] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  // Get current date/time for receipt
  useEffect(() => {
    setCurrentDateTime(new Date().toLocaleString('mn-MN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }, []);

  // Generate unique codes on mount if cart is not empty
  useEffect(() => {
    if (cart.length > 0 && !transferCode && cart[0]?.product?.name) {
      const productPrefix = cart[0].product.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
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
      toast.info('Уучлаарай, бид төлбөрийн системтэй хараахан холбогдоогүй байна. Төлбөрөө заавал шилжүүлгээр хийгээрэй.', {
        icon: <Info className="h-5 w-5 text-blue-300" />,
        style: { background: '#1e40af', color: 'white', border: 'none', borderRadius: '12px' },
        duration: 8000,
      });
      setInfoToastShown(true);
    }
    if (step === 1) {
      setInfoToastShown(false);
    }
  }, [step, infoToastShown]);

  // Calculate prices
  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5000;
  const commissionRate = 0.15; // 15% commission
  const commissionFee = subtotal * commissionRate;
  const grandTotal = subtotal + deliveryFee + commissionFee;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'province' && { district: '' }),
    }));
  };

  const handlePaymentMethodSelect = (key: BankAccountKey) => {
    setPaymentMethod(key);
  };

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

  const showToastError = (message: string) => {
    toast.error(message, {
      style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px' },
    });
  };

  const isCyrillicName = (name: string): boolean => /^[\u0400-\u04FF\u0500-\u052F\s]+$/.test(name.trim());
  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = (phone: string): boolean => /^\d{8}$/.test(phone.trim());

  const validateShippingInfo = (): boolean => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) { showToastError('Нэрээ оруулна уу.'); return false; }
    if (!isCyrillicName(trimmedName)) { showToastError('Нэрээ заавал кирилл үсгээр бичнэ үү.'); return false; }
    if (!trimmedPhone) { showToastError('Утасны дугаараа оруулна уу.'); return false; }
    if (!isValidPhone(trimmedPhone)) { showToastError('Утасны дугаараа зөв оруулна уу (яг 8 оронтой тоо).'); return false; }
    if (!trimmedEmail) { showToastError('И-мэйл хаягаа оруулна уу.'); return false; }
    if (!isValidEmail(trimmedEmail)) { showToastError('И-мэйл хаягаа зөв оруулна уу.'); return false; }
    if (!formData.province) { showToastError('Аймаг/Хот сонгоно уу.'); return false; }
    if (!formData.district) { showToastError('Дүүрэг/Сум сонгоно уу.'); return false; }
    if (!trimmedAddress) { showToastError('Дэлгэрэнгүй хаягаа оруулна уу.'); return false; }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateShippingInfo()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepNavigation = (targetStep: number) => {
    if (targetStep === 1) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep === 2) {
      handleContinueToPayment();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShippingInfo()) {
      setStep(1);
      showToastError('Хүргэлтийн мэдээллээ бүрэн шалгана уу.');
      return;
    }
    if (!paymentMethod) {
      showToastError('Төлбөрийн хэрэгсэл сонгоно уу.');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderPayload = {
        _type: 'order',
        orderNumber,
        transferCode,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        province: formData.province,
        district: formData.district,
        address: formData.address,
        paymentMethod,
        bankName: bankAccounts[paymentMethod].name,
        bankAccount: bankAccounts[paymentMethod].number,
        subtotal,
        deliveryFee,
        commissionFee,
        totalAmount: grandTotal,
        orderStatus: 'PendingPayment',
        items: cart.map((item: CartItem) => ({
          _key: `${item.product.id}-${item.size}`,
          productId: item.product.id,
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.product.mainPictureUrl // <-- ADD THIS LINE

        })),
        createdAt: new Date().toISOString(),
      };
      const response = await fetch('/api/createorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            errorData = await response.json();
        } else {
            const textError = await response.text();
            errorData = { message: `Серверээс алдаатай хариу буцлаа: ${response.status}. ${textError.substring(0, 100)}...` };
        }
        throw new Error(errorData.message || 'Захиалга үүсгэхэд алдаа гарлаа.');
      }

      setIsSubmittedSuccessfully(true);
      toast.success(`Захиалга #${orderNumber} амжилттай! Гүйлгээний утга: ${transferCode}. Төлбөрөө шилжүүлнэ үү.`, {
        style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px' },
        duration: 10000
      });
      clearCart();
      router.push('/payment-success');
    } catch (error: unknown) {
      console.error("Order submission error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Дахин оролдоно уу.';
      showToastError(`Захиалга илгээхэд алдаа гарлаа: ${errorMessage}`);
      setIsSubmittedSuccessfully(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSubmitting && !isSubmittedSuccessfully) {
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

  const ProgressIndicator = () => (
    <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full max-w-xs sm:max-w-sm">
            <div className="flex flex-col items-center">
                <button type="button" onClick={() => handleStepNavigation(1)} className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'} font-semibold transition-colors duration-300 ${step !== 1 ? 'cursor-pointer hover:bg-neutral-700 hover:text-white' : ''}`} disabled={step === 1 && !isSubmitting} aria-label="Go to Step 1: Shipping">1</button>
                <span className={`mt-1.5 text-xs ${step >= 1 ? 'text-neutral-100 font-medium' : 'text-neutral-400'} ${step !== 1 ? 'cursor-pointer hover:text-white' : ''}`} onClick={() => step !== 1 && handleStepNavigation(1)}>Хүргэлт</span>
            </div>
            <div className={`flex-grow h-0.5 mt-[-1em] ${step >= 2 ? 'bg-white' : 'bg-neutral-800'} transition-colors duration-300`}></div>
            <div className="flex flex-col items-center">
                <button type="button" onClick={() => handleStepNavigation(2)} className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'} font-semibold transition-colors duration-300 ${step !== 2 ? 'cursor-pointer hover:bg-neutral-700 hover:text-white' : ''}`} disabled={(step === 2 && !isSubmitting) || isSubmitting} aria-label="Go to Step 2: Payment">2</button>
                <span className={`mt-1.5 text-xs ${step >= 2 ? 'text-neutral-100 font-medium' : 'text-neutral-400'} ${step !== 2 ? 'cursor-pointer hover:text-white' : ''}`} onClick={() => step !== 2 && handleStepNavigation(2)}>Төлбөр</span>
            </div>
        </div>
    </div>
);


  return (
    <div className="min-h-screen   bg-black text-neutral-100 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="bottom-right" richColors />
      <div className="max-w-6xl mx-auto mb-6">
        <Button variant="ghost" onClick={() => step === 1 ? router.back() : handleStepNavigation(1)} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 px-0 hover:bg-transparent" aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Буцах' : 'Хүргэлтийн мэдээлэл рүү буцах'}
        </Button>
      </div>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-neutral-100 mb-4 text-center">{step === 1 ? 'Хүргэлтийн мэдээлэл' : 'Төлбөрийн хэлбэр'}</h1>
        <ProgressIndicator />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-neutral-800">
                      <CardTitle className="text-xl font-medium text-neutral-100">Хүргэлтийн мэдээлэл</CardTitle>
                      <CardDescription className="text-neutral-400">Барааг хүлээн авах хүний мэдээллийг үнэн зөв оруулна уу.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
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
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-neutral-400 font-medium">И-мэйл хаяг<span className="text-red-500">*</span></Label>
                        <Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required autoComplete="email" className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500 h-12" placeholder="yourname@example.com" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-neutral-400 font-medium">Аймаг/Хот<span className="text-red-500">*</span></Label>
                          <Select value={formData.province} onValueChange={(value) => handleSelectChange('province', value)}>
                            <SelectTrigger className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 h-12">
                              <SelectValue placeholder="Аймаг/Хот сонгоно уу" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100 max-h-60">
                              {Object.keys(mongolianLocations).sort().map((province) => (
                                <SelectItem key={province} value={province} className="hover:bg-neutral-700 focus:bg-neutral-700">{province}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-neutral-400 font-medium">Дүүрэг/Сум<span className="text-red-500">*</span></Label>
                          <Select value={formData.district} onValueChange={(value) => handleSelectChange('district', value)} disabled={!formData.province}>
                            <SelectTrigger className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 h-12">
                              <SelectValue placeholder="Дүүрэг/Сум сонгоно уу" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100 max-h-60">
                              {formData.province && mongolianLocations[formData.province]?.sort().map((district) => (
                                <SelectItem key={district} value={district} className="hover:bg-neutral-700 focus:bg-neutral-700">{district}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-neutral-400 font-medium">Дэлгэрэнгүй хаяг<span className="text-red-500">*</span></Label>
                        <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required rows={3} aria-required="true" placeholder="Гудамж, хороолол, байр, орц, тоот..." className="bg-neutral-800 border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-neutral-800">
                      <CardTitle className="text-xl font-medium text-neutral-100">Төлбөрийн хэрэгсэл сонгох</CardTitle>
                      <CardDescription className="text-neutral-400">Төлбөрөө доорх данснуудын аль нэг рүү шилжүүлж, гүйлгээний утгад кодыг бичээд захиалгаа баталгаажуулна уу.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div>
                        <Label className="text-neutral-400 font-medium mb-3 block">Шилжүүлэх Банк<span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                          {Object.entries(bankAccounts).map(([key, { name }]) => {
                            const isSelected = paymentMethod === key;
                            return (
                              <button type="button" key={key} onClick={() => handlePaymentMethodSelect(key as BankAccountKey)} className={`relative p-4 h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl border-2 text-center transition-all duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${isSelected ? 'bg-blue-950/30 border-blue-600 ring-2 ring-blue-600 ring-offset-1 ring-offset-neutral-900' : 'bg-neutral-800 border-neutral-700 hover:border-neutral-500 hover:bg-neutral-700/50'}`} aria-pressed={isSelected}>
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

                      {paymentMethod && bankAccounts[paymentMethod] && (
                        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '24px' }} transition={{ duration: 0.3, ease: "easeOut" }} className="bg-gradient-to-br from-indigo-950/70 via-neutral-900 to-neutral-900 border border-indigo-800/40 p-5 sm:p-6 rounded-2xl shadow-lg overflow-hidden">
                          <h3 className="font-medium text-indigo-300 mb-4 flex items-center gap-2 text-lg">
                            <Landmark className="h-5 w-5 flex-shrink-0 text-indigo-400" />
                            Төлбөр хүлээн авагч
                          </h3>
                          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm sm:text-base text-indigo-100 mb-5">
                            <dt className="font-medium text-indigo-300/90">Банк:</dt>
                            <dd className="text-indigo-100">{bankAccounts[paymentMethod].name}</dd>
                            <dt className="font-medium text-indigo-300/90 self-start pt-1">IBAN:</dt>
                            <dd className="font-mono text-indigo-50 text-lg sm:text-xl tracking-wider bg-indigo-900/50 px-3 py-1 rounded-md w-fit">{bankAccounts[paymentMethod].IBAN}</dd>
                            <dt className="font-medium text-indigo-300/90 self-start pt-1">Данс:</dt>
                            <dd className="font-mono text-indigo-50 text-lg sm:text-xl tracking-wider bg-indigo-900/50 px-3 py-1 rounded-md w-fit">{bankAccounts[paymentMethod].number}</dd>
                            <dt className="font-medium text-indigo-300/90">Хүлээн авагч:</dt>
                            <dd className="text-indigo-100">{bankAccounts[paymentMethod].recipient}</dd>
                          </dl>
                          <Separator className="my-5 bg-indigo-800/30" />
                          <div>
                            <span className="font-medium text-indigo-300/90 block mb-2 text-sm sm:text-base">Гүйлгээний утга (Заавал хуулж бичнэ үү):</span>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-indigo-900/60 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-xl border border-indigo-700/50 w-fit">
                              <span className="font-bold text-indigo-50 text-xl sm:text-2xl tracking-widest">{transferCode}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 p-0 text-indigo-300 hover:bg-indigo-700/70 hover:text-indigo-100 rounded-full" onClick={handleCopyCode} aria-label="Copy transfer code" disabled={!transferCode}>
                                {isCopied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-indigo-200/90 pt-4 mt-4 bg-indigo-950/40 p-3 sm:p-4 rounded-xl border border-indigo-800/30">
                              <div className="flex items-start gap-2">
                                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-300" />
                                  <p><span className="font-medium text-indigo-100">Анхаарах зүйл:</span> Төлбөр хийсний дараа захиалгын дугаар <span className="font-bold">{orderNumber}</span> болон гүйлгээний утга <span className="font-mono font-bold">{transferCode}</span> зөв бичсэн эсэхийг шалгана уу. Төлбөр хийгдэх хүртэл захиалга хүчинтэй байх хугацаа 24 цаг.</p>
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

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-neutral-800">
                  <CardTitle className="text-xl font-medium text-neutral-100">Захиалгын дэлгэрэнгүй</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                    {cart.map((item: CartItem) => (
                      <div key={`${item.product.id}-${item.size}`} className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0">
                                {item.product.mainPictureUrl ? (
                                    <Image src={item.product.mainPictureUrl} alt={item.product.name} fill className="object-cover" sizes="128px" />
                                ) : (
                                    <ShoppingBag className="h-12 w-12 text-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-100 line-clamp-2">{item.product.name}</p>
                                <p className="text-xs text-neutral-400">Хэмжээ: {item.size} &times; {item.quantity}</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-neutral-100 pl-2 flex-shrink-0">
                          {(item.price * item.quantity).toLocaleString()}₮
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between text-neutral-300">
                      <span>Барааны дүн:</span>
                      <span className="font-medium text-neutral-100">{subtotal.toLocaleString()}₮</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Хүргэлтийн төлбөр:</span>
                      <span className="font-medium text-neutral-100">{deliveryFee.toLocaleString()}₮</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Үйлчилгээний шимтгэл (15%):</span>
                      <span className="font-medium text-neutral-100">{commissionFee.toLocaleString()}₮</span>
                    </div>
                  </div>
                  <Separator className="bg-neutral-700/50 mb-6" />
                  <div className="flex justify-between text-lg font-semibold mb-6 text-neutral-100">
                    <span>Нийт төлөх дүн:</span>
                    <span>{grandTotal.toLocaleString()}₮</span>
                  </div>
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
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Баталгаажуулж байна...
                        </span>
                      ) : (
                        'Захиалга баталгаажуулах'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
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