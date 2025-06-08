import React from 'react';
import './(frontend)/styles.css'; // Assuming this path is correct relative to the layout file
import Navbar from '@/components/Heading/Navbar';
// Corrected Footer import based on assumption (PascalCase component name)
// Verify this path matches your actual file structure and casing!
import Footer from '@/components/Footer';
import { Analytics } from "@vercel/analytics/next"

import { ProductProvider } from './context/ProductContext'; // Check relative path
import NextTopLoader from 'nextjs-toploader';

// Metadata remains the same
export const metadata = {
  title: 'Saint | Mongolia’s First & Finest Premium Fashion & Sneaker Retailer',
  description:
    'Saint is Mongolia’s first and finest platform offering authentic streetwear, luxury sneakers, and designer brands including Yeezy, Jordan, Bape, Maison Margiela, Birkin, and more — exclusively sold by us.',
  openGraph: {
    title: 'Saint | Mongolia’s First & Finest Premium Fashion & Sneaker Retailer',
    description:
    'Saint is Mongolia’s first premium platform for authentic streetwear, sneakers, and designer fashion.',
  
    url: 'https://sainto.vercel.app', // <-- your site URL
    siteName: 'Saint Mongolia',
    images: [
      {
        url: 'https://sainto.vercel.app/_next/static/media/Logo.bbf2dc13.svg', // <-- must be absolute URL
        width: 1200,
        height: 630,
        alt: 'Saint Mongolia Logo or Banner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saint | Mongolia’s First & Finest Premium Fashion & Sneaker Retailer',
    description:
      'Saint is Mongolia’s first and finest platform offering authentic streetwear and luxury sneakers.',
    images: ['https://sainto.vercel.app/_next/static/media/Logo.bbf2dc13.svg'], // same image as Open Graph
  },
};


// RootLayout component definition
export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        {/* Consider placing Navbar outside the main content div if it should always be visible */}
        <div className="pb-20">
          <Navbar />
        </div>

        {/* ProductProvider should ideally wrap only the parts that need the context */}
        <ProductProvider>
          <main>
            {/* NextTopLoader setup */}
            <div className="z-[1000]"> {/* Removed trailing space in class */}
              <NextTopLoader
                color="#ffffff" // Ensure color format is correct (removed trailing space)
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

            {/* Main page content */}
            {children}
            <Analytics />


            {/* Footer component */}
            <Footer />
          </main>
        </ProductProvider>
      </body>
    </html>
  );
}
