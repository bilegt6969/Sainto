import React from 'react';
import './styles.css'; // Assuming this path is correct relative to the layout file
import Navbar from '@/components/Heading/Navbar';
// Corrected Footer import based on assumption (PascalCase component name)
// Verify this path matches your actual file structure and casing!
import Footer from '@/components/Footer';
import { Analytics } from "@vercel/analytics/next"

import { ProductProvider } from '../context/ProductContext'; // Check relative path
import NextTopLoader from 'nextjs-toploader';

// Metadata remains the same
export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Saint. 2025.',
  icons: {
    icon: [
      '/favico/favicon-32x32.png?v=4',
      '/favico/favicon-16x16.png?v=4',
      '/favico/favicon.ico?v=4',
    ],
    apple: ['/icons/favico/apple-touch-icon.png?v=4'],
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
