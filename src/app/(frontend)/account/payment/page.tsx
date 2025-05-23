'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/firebaseConfig'
import { User, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, PlusCircle, Trash2 } from 'lucide-react'
import { Skeleton } from '@heroui/skeleton' // Assuming component exists
import { Button } from '@/components/ui/button' // Assuming component exists

// Mock Payment Method Structure (Adapt to your actual structure/provider)
interface PaymentMethod {
  id: string;
  type: 'card'; // Could be 'paypal', 'bank', etc.
  last4: string;
  brand: string; // e.g., 'Visa', 'Mastercard'
  isDefault: boolean;
  expiryMonth: number;
  expiryYear: number;
}

// Mock function to fetch payment methods
const fetchPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
   console.log("Fetching payment methods for user:", userId);
   await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay

   // Return mock data or empty array
    // return []; // Simulate no methods
    return [
      { id: 'pm_123', type: 'card', last4: '4242', brand: 'Visa', isDefault: true, expiryMonth: 12, expiryYear: 2027 },
      { id: 'pm_456', type: 'card', last4: '5555', brand: 'Mastercard', isDefault: false, expiryMonth: 8, expiryYear: 2025 },
    ];
};

// Mock function to delete a payment method
const deletePaymentMethod = async (userId: string, paymentMethodId: string): Promise<void> => {
    console.log(`Deleting payment method ${paymentMethodId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    // Add actual API call here
    // Handle potential errors
    return Promise.resolve();
}


const PaymentPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which card is being deleted
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          const methods = await fetchPaymentMethods(currentUser.uid)
          setPaymentMethods(methods)
        } catch (error) {
          console.error("Error fetching payment methods:", error)
          // Handle error
        } finally {
            setLoading(false)
        }
      } else {
        router.push('/auth/login')
        setLoading(false);
      }
    })
    return () => unsubscribe()
  }, [router])

   const handleDelete = async (id: string) => {
      if (!user) return;
      setDeletingId(id);
      try {
         await deletePaymentMethod(user.uid, id);
         setPaymentMethods(prev => prev.filter(method => method.id !== id));
         // Show success toast
          alert('Төлбөрийн хэрэгсэл устгагдлаа.'); // Replace with toast
      } catch (error) {
          console.error("Error deleting payment method:", error);
          // Show error toast
          alert('Төлбөрийн хэрэгсэл устгахад алдаа гарлаа.'); // Replace with toast
      } finally {
          setDeletingId(null);
      }
  };

  // Function to handle adding a new payment method (would typically open Stripe Elements or similar)
   const handleAddPaymentMethod = () => {
       alert("Шинэ төлбөрийн хэрэгсэл нэмэх (интеграц хийгдээгүй).");
       // Implement integration with payment provider SDK here
   };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black min-h-screen text-white p-6">
      <div className="max-w-3xl mx-auto">
         {/* Back Link */}
         <Link href="/account" className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-6 group">
           <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
           Миний булан руу буцах
         </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white tracking-tight">Төлбөрийн хэрэгслүүд</h1>
          <p className="text-neutral-400 text-lg mt-1">Хадгалсан төлбөрийн аргуудаа удирдах.</p>
        </div>

        {/* Payment Methods List */}
        <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-neutral-800/50 shadow-lg">
          <div className="flex justify-between items-center mb-6 border-b border-neutral-700 pb-4">
             <h2 className="text-xl font-semibold text-white">Хадгалсан картууд</h2>
             <Button
               variant="outline"
               className="text-purple-400 border-purple-600/50 hover:bg-purple-900/30 rounded-full px-4 py-1.5 text-sm font-medium"
               onClick={handleAddPaymentMethod}
              >
               <PlusCircle className="h-4 w-4 mr-2" />
               Шинээр нэмэх
             </Button>
           </div>

          {loading ? (
             // Loading Skeleton
             <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                       <div className="flex items-center">
                          <Skeleton className="h-8 w-12 mr-4 rounded" />
                          <div>
                             <Skeleton className="h-5 w-36 mb-1" />
                             <Skeleton className="h-4 w-24" />
                          </div>
                       </div>
                       <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                ))}
             </div>
          ) : paymentMethods.length > 0 ? (
            // Display Payment Methods
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-neutral-800/30 border border-neutral-700/50 rounded-lg hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-center">
                     {/* Basic Card Icon - Could be replaced with dynamic brand logos */}
                     <CreditCard className="h-8 w-12 mr-4 text-neutral-400 flex-shrink-0" />
                     <div>
                       <p className="font-medium text-white">
                         {method.brand} <span className="text-neutral-300">•••• {method.last4}</span>
                         {method.isDefault && <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/40">Үндсэн</span>}
                       </p>
                       <p className="text-sm text-neutral-400">Хүчинтэй хугацаа: {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}</p>
                     </div>
                  </div>
                  <Button
                     variant="ghost"
                     size="icon"
                     className="text-neutral-500 hover:text-red-500 hover:bg-red-900/30 rounded-full disabled:opacity-50"
                     onClick={() => handleDelete(method.id)}
                     disabled={deletingId === method.id}
                     title="Устгах"
                   >
                     {deletingId === method.id ? <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <Trash2 className="h-4 w-4" />}
                   </Button>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
               <CreditCard className="h-16 w-16 mx-auto text-neutral-600 mb-4" />
               <h3 className="text-xl font-semibold text-white mb-2">Төлбөрийн хэрэгсэл алга</h3>
               <p className="text-neutral-400 mb-6">Та одоогоор хадгалсан төлбөрийн хэрэгсэлгүй байна.</p>
                <Button
                   className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 font-medium"
                    onClick={handleAddPaymentMethod}
                 >
                  Шинэ хэрэгсэл нэмэх
                </Button>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentPage