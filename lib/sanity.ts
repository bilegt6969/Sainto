// lib/sanity.ts
// This file configures and exports the Sanity client and an image URL builder.

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

/**
 * The configured Sanity client.
 * It uses environment variables for the project ID and dataset, with fallbacks
 * for easier setup.
 */
export const client = createClient({
  // Use environment variables, but provide default fallbacks
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'c7bxnoyq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03', // Use a recent API version for stability
  useCdn: true, // Recommended for production for faster responses
})

// Create an image URL builder instance
const builder = imageUrlBuilder(client)

/**
 * A helper function to generate image URLs from Sanity image sources.
 * This is the standard way to render images from Sanity in a Next.js app.
 * @param source - The Sanity image source object.
 * @returns A URL builder instance for the given image source.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// GROQ query to fetch a single product collection by slug
export const getProductCollectionQuery = `
  *[_type == "productCollection" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    rawProductJson,
    order
  }
`;

// GROQ query to fetch all product collections metadata (for listing)
export const getAllProductCollectionsQuery = `
  *[_type == "productCollection"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    order
  }
`;

// GROQ query to fetch all product collections with full data (for reference)
export const getAllProductCollectionsWithDataQuery = `
  *[_type == "productCollection"] | order(order asc) {
    _id,
    name,
    slug,
    rawProductJson,
    order
  }
`;