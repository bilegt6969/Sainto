// app/api/payload/collections/route.js

import { NextResponse } from 'next/server';
import { client as sanityClient } from '../../../../lib/sanity'; // Ensure this path is correct for your Sanity client

/**
 * Handles GET requests to the API endpoint.
 * Fetches raw product JSON string from Sanity, parses it, and returns the product data.
 *
 * @returns {NextResponse} A JSON response containing the product data or an error message.
 */
 export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortOrder = searchParams.get('sort');

    // Fetch both rawProductJson and name
    const sanityCollectionsData = await sanityClient.fetch(`*[_type == "productCollection"]{
      name,
      rawProductJson,
      order // Ensure 'order' is fetched from Sanity if it exists there
    }`);

    let allCollections = [];

    sanityCollectionsData.forEach((collection) => {
      if (collection.rawProductJson) {
        try {
          const parsedProducts = JSON.parse(collection.rawProductJson);

          if (Array.isArray(parsedProducts)) {
            // Add collection name to each product object
            const productsWithCollection = parsedProducts.map(product => ({
              ...product,
              collectionName: collection.name // Add collectionName here
            }));

            allCollections.push({
              name: collection.name,
              // Assuming there's an 'order' field in your Sanity collection schema
              // If not, you might need to add it or derive it.
              order: collection.order || 0, // Default to 0 if order is not explicitly set in Sanity
              url: `/collections/${collection.name.toLowerCase().replace(/\s+/g, '-')}`, // Example URL
              // CRITICAL CHANGE: Nest products inside 'data' and 'productsList' to match screenshot
              products: [{
                data: {
                  totalResults: productsWithCollection.length,
                  productsList: productsWithCollection,
                }
              }],
            });
          } else {
            console.warn(
              `Sanity document contains non-array JSON (doc: ${collection._id || 'unknown'}):`,
              collection.rawProductJson
            );
          }
        } catch (e) {
          console.error(
            `Error parsing rawProductJson (doc: ${collection._id || 'unknown'}):`,
            e
          );
        }
      }
    });

    // Apply sorting if requested
    if (sortOrder === 'order') {
      allCollections.sort((a, b) => a.order - b.order);
    }

    // The API response format now matches the screenshot
    return NextResponse.json(
      allCollections, // Directly return the array of processed collections
      { status: 200 }
    );

  } catch (apiError) {
    console.error('Error fetching and parsing product data from Sanity:', apiError);
    return NextResponse.json(
      { message: 'Internal Server Error', error: apiError.message },
      { status: 500 }
    );
  }
}
