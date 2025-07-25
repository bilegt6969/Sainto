'use client'

  import Link from 'next/link'
  import { useEffect } from 'react'
  import useOrderStore from '../orderStore' // Assuming path is correct
  import { CheckCircle2, Home } from 'lucide-react'
  import { Button } from '@/components/ui/button'

  export default function PaymentSuccessPage() {
    const { transferCode, orderNumber, clearOrder } = useOrderStore()

    // Clear order details when the component unmounts (user navigates away)
    useEffect(() => {
      return () => clearOrder()
    }, [clearOrder])

    return (
      <div className="min-h-screen bg-black  flex items-center justify-center p-4">
        {/* Main Content Card */}
        <div className="w-full max-w-md bg-neutral-900 rounded-4xl border border-neutral-800 overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-900/50 mb-5"> {/* Darker green bg */}
              <CheckCircle2 className="h-9 w-9 text-green-500" /> {/* Slightly larger icon */}
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-semibold text-neutral-100 mb-2">Захиалга амжилттай!</h1>
            <p className="text-neutral-400 mb-8"> {/* Increased bottom margin */}
              Таны захиалга амжилттай хийгдлээ. Төлбөрөө баталгаажуулна уу.
            </p>

            {/* Order Details Section */}
            <div className="space-y-4 mb-8"> {/* Increased bottom margin */}
              {/* Order Number Box */}
              {orderNumber && (
                <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 text-left">
                  <p className="text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Захиалгын дугаар</p>
                  <p className="text-lg font-medium text-neutral-100">{orderNumber}</p>
                </div>
              )}

              {/* Transfer Code Box */}
              {transferCode && (
                <div className="bg-blue-950/60 rounded-lg border border-blue-800/80 p-4 text-left">
                  <p className="text-xs font-medium text-blue-400 mb-1 uppercase tracking-wider">Гүйлгээний утга (Код)</p>
                  <p className="text-lg font-bold text-blue-200">{transferCode}</p>
                  <p className="text-xs text-blue-300/90 mt-2">
                    Банкны шилжүүлэг хийхдээ гүйлгээний утга дээр <span className="font-semibold">энэ кодыг ЗААВАЛ</span> бичнэ үү.
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info (Optional) */}
            {/* <p className="text-sm text-neutral-500 mb-8">
              Захиалгын дэлгэрэнгүй мэдээллийг таны и-мэйл хаяг руу илгээлээ.
            </p> */}

            {/* Back to Home Button */}
            <div className="w-full">
              {/* Using asChild to make the whole button a link */}
              <Button asChild size="lg" className="w-full bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-800">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Нүүр хуудас руу буцах
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <style>{`
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
    )
  }