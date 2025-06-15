'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define the expected shapes of the data for clarity
type CatApiResponseData = { url: string }[];
type DogApiResponseData = { message: string };
type RandomApiImageData = CatApiResponseData | DogApiResponseData;

export default function NotFound() {
  const [imageUrl, setImageUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRandomImage = async () => {
      setIsLoading(true);
      try {
        const useCatAPI = Math.random() > 0.5;
        let apiUrl: string;
        let imageExtractor: (data: RandomApiImageData) => string;

        if (useCatAPI) {
          apiUrl = 'https://api.thecatapi.com/v1/images/search';
          imageExtractor = (dataFromApi) => {
            const catData = dataFromApi as CatApiResponseData;
            // Ensure data is in the expected format
            if (catData && catData.length > 0 && typeof catData[0]?.url === 'string') {
              return catData[0].url;
            }
            throw new Error('Malformed Cat API response or empty data');
          };
        } else {
          apiUrl = 'https://dog.ceo/api/breeds/image/random';
          imageExtractor = (dataFromApi) => {
            const dogData = dataFromApi as DogApiResponseData;
            // Ensure data is in the expected format
            if (dogData && typeof dogData.message === 'string') {
              return dogData.message;
            }
            throw new Error('Malformed Dog API response');
          };
        }

        const res = await fetch(apiUrl);
        if (!res.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          throw new Error(`API request failed with status ${res.status}`);
        }
        const jsonData = await res.json();
        setImageUrl(imageExtractor(jsonData as RandomApiImageData)); // Assert type for jsonData
      } catch (error) {
        console.error('Failed to fetch image:', error);
        setImageUrl(''); // Set to empty or a fallback image URL on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomImage();
  }, []);

  return (
    <div className="min-h-screen bg-black  flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-100 mb-2">Хуудас олдсонгүй</h1>
          <p className="text-neutral-400 mb-8">Уучлаарай, таны хайж буй хуудас байхгүй байна.</p>

          {/* Random Image */}
          <div className="mb-8">
            {isLoading ? (
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 aspect-square flex items-center justify-center">
                <div className="animate-pulse h-full w-full bg-neutral-700 rounded-lg"></div>
              </div>
            ) : imageUrl ? (
              <div className="relative w-full h-64 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Random pet"
                  fill
                  className="object-cover"
                  onError={() => {
                    // Handle image loading errors, e.g., set to a fallback or clear
                    console.error('Failed to load image from URL:', imageUrl);
                    setImageUrl('');
                  }}
                  sizes="100%"
                />
              </div>
            ) : (
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 aspect-square flex items-center justify-center">
                <p className="text-neutral-400">Зураг ачаалахад алдаа гарлаа</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Нүүр хуудас руу буцах
              </Link>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="w-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Буцах
            </Button>
          </div>
        </div>
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