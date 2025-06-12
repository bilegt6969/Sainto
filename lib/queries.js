// web/lib/queries.js

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// This query is now corrected to match your schema.
export const heroQuery = `*[_type == "hero"][0]{
  carouselSettings,
  
  "slides": slides[]{
    _key,
    
    // THE FIX IS HERE:
    // We are now projecting the fields (imageDesktop, etc.)
    // into a new object called "images" that our component expects.
    "images": {
      "desktop": imageDesktop,
      "tablet": imageTablet,
      "mobile": imageMobile
    }
  }
}`;


// --- The rest of the file remains the same ---

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'c7bxnoyq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}