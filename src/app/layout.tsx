// app/layout.tsx (your RootLayout)
import React from 'react';
import './(frontend)/styles.css';
import { Analytics } from "@vercel/analytics/next";
import { ProductProvider } from './context/ProductContext';
import NextTopLoader from 'nextjs-toploader';
import InvestButton from '../components/InvestButton';
import {Inter_Tight } from 'next/font/google';

// Import the new Client Component wrapper
import LayoutClientWrapper from '@/components/LayoutClientWrapper';

// Configure Inter font
const inter = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'SAINTO® | Curated Luxury for the Discerning',
    template: '%s | SAINTO Mongolia'
  },
  description: 'Mongolia\'s premier destination for authenticated rare sneakers, avant-garde streetwear, and timeless designer pieces. Experience curation at the intersection of culture and craftsmanship.',
  metadataBase: new URL('https://sainto.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SAINTO® | Beyond Fashion — A Cultural Movement',
    description: 'Where Mongolia\'s elite discover the extraordinary. Each piece undergoes our 47-point verification process, representing the pinnacle of streetwear and luxury fashion.',
    url: 'https://sainto.vercel.app',
    siteName: 'sainto MONGOLIA',
    images: [
      {
        url: 'https://sainto.vercel.app/_next/static/media/Logo.bbf2dc13.svg',
        width: 1200,
        height: 630,
        alt: 'SAINTO® Mongolia - Black background with minimalist gold logo and curated product display',
      },
    ],
    type: 'website',
    locale: 'en_US',
    publishedTime: '2023-01-01T00:00:00.000Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAINTO® | The Art of Wearable Distinction',
    description: 'We don\'t sell products — we offer entry into an exclusive world where every stitch tells a story. Your journey into elevated style begins here.',
    creator: '@saintomongolia',
    images: ['https://sainto.vercel.app/_next/static/media/Logo.bbf2dc13.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      '/favicon.ico',
      { url: '/favico/favicon-16x16.png?v=4', sizes: '16x16', type: 'image/png' },
      { url: '/favico/favicon-32x32.png?v=4', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favico/apple-touch-icon.png?v=4', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/favico/android-chrome-192x192.png?v=4'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/favico/android-chrome-512x512.png?v=4'
      }
    ]
  },
  manifest: '/favico/site.webmanifest',
  verification: {
    google: '9LAxenlZQeQyX_2239qDfra5qM_EITEwMSfpRGvlNRw',
  },
  appleWebApp: {
    capable: true,
    title: 'sainto Mongolia',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`antialiased ${inter.variable}`}>
      <body className="bg-black text-white selection:bg-gold selection:text-black font-sans">
        <ProductProvider>
          {/* Loading Bar */}
          <div className="z-[1000]">
            <NextTopLoader
              color="#FFFFFF"
              initialPosition={0.08}
              crawlSpeed={100}
              height={3}
              crawl={true}
              showSpinner={true}
              easing="ease"
              speed={200}
              shadow="0 0 10px #2299DD,0 0 5px #2299DD"
              template='<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
              zIndex={1600}
              showAtBottom={false}
            />
          </div>

          {/* Page Container with Flexbox Layout */}
          <div className={`min-h-screen flex flex-col antialiased ${inter.className}`}>
            {/* Wrap the children with the new client component */}
            <LayoutClientWrapper>
              {children}
            </LayoutClientWrapper>
          </div>
          <Analytics />
          <InvestButton />
        </ProductProvider>
      </body>
    </html>
  );
}