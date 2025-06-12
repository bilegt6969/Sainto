// web/src/app/(frontend)/page.tsx

import React from 'react';
import Product from './product/page';
import { client } from '../../../lib/sanity';
import { heroQuery } from '../../../lib/queries';
import HeroSection from '../../components/HeroSection';

export default async function HomePage() {
  let heroData;
  
  try {
    // Fetch the data from Sanity
    const fetchedData = await client.fetch(heroQuery);
    
    // Log the raw data for debugging
     
    // THE FIX: Ensure heroData has a valid structure, even if the fetch returns nulls.
    // This creates a clean, predictable object to pass to the client component.
    heroData = {
      slides: fetchedData?.slides || [],
      carouselSettings: fetchedData?.carouselSettings || {}
    };

  } catch (error) {
    console.error('Failed to fetch hero data:', error);
    // If the entire fetch fails, provide a default structure to prevent crashes.
    heroData = {
      slides: [],
      carouselSettings: {}
    };
  }

  return (
    <main>
      <HeroSection heroData={heroData} />
      
      {/* Rest of your page content */}
      <section className="py-12">
        {/* Your product grid or other content */}
        <Product />
      </section>
    </main>
  );
}

// Using force-dynamic is good for ensuring the data is fresh on each request.
export const dynamic = 'force-dynamic';
