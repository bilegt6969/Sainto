import React from 'react';
import './(frontend)/styles.css';
import Navbar from '@/components/Heading/Navbar';
import Footer from '@/components/Footer';
import { Analytics } from "@vercel/analytics/next"
import { ProductProvider } from './context/ProductContext';
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: {
    default: 'SAINT | Curated Luxury for the Discerning',
    template: '%s | SAINT Mongolia'
  },
  description: 'Mongolia\'s premier destination for authenticated rare sneakers, avant-garde streetwear, and timeless designer pieces. Experience curation at the intersection of culture and craftsmanship.',
  metadataBase: new URL('https://sainto.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SAINT | Beyond Fashion — A Cultural Movement',
    description: 'Where Mongolia\'s elite discover the extraordinary. Each piece undergoes our 47-point verification process, representing the pinnacle of streetwear and luxury fashion.',
    url: 'https://sainto.vercel.app',
    siteName: 'SAINT MONGOLIA',
    images: [
      {
        url: '/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'SAINT Mongolia - Black background with minimalist gold logo and curated product display',
      },
    ],
    type: 'website',
    locale: 'en_US',
    publishedTime: '2023-01-01T00:00:00.000Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAINT | The Art of Wearable Distinction',
    description: 'We don\'t sell products — we offer entry into an exclusive world where every stitch tells a story. Your journey into elevated style begins here.',
    creator: '@saintmongolia',
    images: ['/twitter-banner.jpg'],
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
      { url: '/favicon.ico' },
      new URL('/favicon.ico', 'https://sainto.vercel.app'),
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
  appleWebApp: {
    capable: true,
    title: 'SAINT Mongolia',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/mstile-144x144.png',
    'theme-color': '#000000',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-black text-white selection:bg-gold selection:text-black">
        <ProductProvider>
          <div className="pb-20">
            <Navbar />
          </div>
          
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

          <main className="relative overflow-hidden">
            {children}
            <Analytics />
          </main>

          <Footer />
        </ProductProvider>
      </body>
    </html>
  );
}