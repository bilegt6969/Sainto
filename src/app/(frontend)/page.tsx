import React from 'react';
import Product from './product/page';
import { client } from '../../../lib/sanity';
import { heroQuery } from '../../../lib/queries';
import HeroSection from '../../components/HeroSection';

export default async function HomePage() {
  let heroData;
  
  try {
    // heroQuery is a string, so we pass it directly to client.fetch()
    heroData = await client.fetch(heroQuery); // No parentheses - it's a string constant
    
    // Log the data to debug (remove in production)
    console.log('Hero data fetched:', heroData);
  } catch (error) {
    console.error('Failed to fetch hero data:', error);
    heroData = null;
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

export const dynamic = 'force-dynamic'; // Optional: for real-time updates