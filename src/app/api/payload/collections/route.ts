// src/app/api/payload/collections/route.js
import { getCollections } from '../../../../../lib/api'

export async function GET() {
  try {
    const collections = await getCollections()
    return new Response(JSON.stringify(collections), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch collections' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Optionally add other HTTP methods
export async function POST() {
  return new Response(null, { status: 405 }) // Method Not Allowed
}