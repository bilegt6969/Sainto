// app/api/payload/collections/route.js

import { NextResponse } from 'next/server';
import { client as sanityClient } from '../../../../../lib/sanity';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortOrder = searchParams.get('sort');

    console.log('--- API Request Started ---');

    const sanityCollectionsData = await sanityClient.fetch(`*[_type == "productCollection"]{
      _id,
      name,
      rawProductJson,
      order
    }`);

    console.log('Fetched collections from Sanity:', sanityCollectionsData.length, 'documents');
    if (sanityCollectionsData.length === 0) {
      console.log('No productCollection documents found in Sanity. Please check your Sanity Studio.');
    }

    let allCollections = [];

    sanityCollectionsData.forEach((collection) => {
      console.log(`Processing collection: ${collection.name || 'Unnamed'} (ID: ${collection._id})`);

      if (!collection.rawProductJson) {
        console.warn(`Collection ${collection.name || 'Unnamed'} (ID: ${collection._id}) has no rawProductJson.`);
        return; // Skip to next collection
      }

      try {
        console.log(`Attempting to parse rawProductJson for ${collection.name || 'Unnamed'} (ID: ${collection._id}).`);
        const parsedRawJson = JSON.parse(collection.rawProductJson); // This is the content from Sanity's rawProductJson field
        console.log('Successfully parsed rawProductJson. Parsed data structure (first 2 keys):', Object.keys(parsedRawJson || {}).slice(0,2));


        let actualProducts = [];

        // --- NEW LOGIC START ---
        // Based on the latest screenshot:
        // 1. The 'rawProductJson' for each collection contains an object.
        // 2. This object has a 'response' key.
        // 3. The 'response' key's value is an object that contains the 'products' array.
        if (parsedRawJson?.response?.products && Array.isArray(parsedRawJson.response.products)) {
            actualProducts = parsedRawJson.response.products;
            console.log(`Extracted ${actualProducts.length} products from 'parsedRawJson.response.products'.`);
        }
        // Fallback for previous structures, just in case (less likely now, but good for robustness)
        else if (parsedRawJson?.data?.productsList && Array.isArray(parsedRawJson.data.productsList)) {
            actualProducts = parsedRawJson.data.productsList;
            console.log(`Extracted ${actualProducts.length} products from 'parsedRawJson.data.productsList'.`);
        }
        else if (Array.isArray(parsedRawJson)) {
            actualProducts = parsedRawJson;
            console.log(`Extracted ${actualProducts.length} products from direct array parse.`);
        }
        else if (parsedRawJson?.['0']?.data?.productsList && Array.isArray(parsedRawJson['0'].data.productsList)) {
            actualProducts = parsedRawJson['0'].data.productsList;
            console.log(`Extracted ${actualProducts.length} products from parsedRawJson['0'].data.productsList.`);
        }
        else {
            console.warn(`Could not find a valid products array in rawProductJson for ${collection.name || 'Unnamed'} (ID: ${collection._id}). Parsed object keys:`, Object.keys(parsedRawJson || {}));
        }
        // --- NEW LOGIC END ---


        if (actualProducts.length > 0) {
          const productsWithCollection = actualProducts.map(product => ({
            ...product,
            collectionName: collection.name // Attach collection name to each product for frontend
          }));

          allCollections.push({
            name: collection.name,
            order: collection.order || 0,
            url: `/collections/${(collection.name || '').toLowerCase().replace(/\s+/g, '-')}`,
            products: productsWithCollection, // This will be the flat list of product objects
          });
          console.log(`Added collection ${collection.name || 'Unnamed'} with ${productsWithCollection.length} products to allCollections.`);
        } else {
          console.warn(
            `Sanity document ${collection.name || 'Unnamed'} (ID: ${collection._id}) resulted in an empty or invalid products list after parsing. Raw JSON snippet:`,
            collection.rawProductJson.substring(0, 200) + '...'
          );
        }
      } catch (e) {
        console.error(
          `Error parsing rawProductJson for ${collection.name || 'Unnamed'} (ID: ${collection._id}):`,
          e.message,
          'Raw JSON snippet:', collection.rawProductJson.substring(0, 200) + '...'
        );
      }
    });

    // Apply sorting if requested
    if (sortOrder === 'order') {
      allCollections.sort((a, b) => a.order - b.order);
      console.log('Collections sorted by order.');
    }

    console.log('Final allCollections length:', allCollections.length);
    console.log('--- API Request Finished ---');

    return NextResponse.json(
      allCollections,
      { status: 200 }
    );

  } catch (apiError) {
    console.error('TOP LEVEL ERROR: Error fetching and parsing product data from Sanity:', apiError.message);
    return NextResponse.json(
      { message: 'Internal Server Error', error: apiError.message },
      { status: 500 }
    );
  }
}