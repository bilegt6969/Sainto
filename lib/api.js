// lib/api.js
import { client } from './sanity'

// Get all collections
export async function getCollections() {
  return await client.fetch(`
    *[_type == "productCollection"] | order(order asc) {
      _id,
      name,
      url,
      order
    }
  `)
}

// Get category URLs by key (el1, el2, etc.)
export async function getCategoryUrlsByKey(key) {
  return await client.fetch(`
    *[_type == "productCategoryUrls" && key == $key] | order(order asc) {
      _id,
      category,
      key,
      urls,
      order
    }
  `, { key })
}