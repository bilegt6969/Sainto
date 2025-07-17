// app/api/payload/collections/route.js

import { NextResponse } from 'next/server';
import { client as sanityClient } from '../../../../../lib/sanity'; // Ensure this path is correct

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortOrder = searchParams.get('sort');

    console.log('--- API Request Started ---');

    // Fetch both rawProductJson and name
    const sanityCollectionsData = await sanityClient.fetch(`*[_type == "productCollection"]{
      _id, // Add _id for better logging
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
        console.log(`Attempting to parse rawProductJson for ${collection.name || 'Unnamed'} (ID: ${collection._id}). Length: ${collection.rawProductJson.length}`);
        const parsedData = JSON.parse(collection.rawProductJson); // This is the entire original JSON object
        console.log('Successfully parsed rawProductJson. Parsed data keys:', Object.keys(parsedData || {}));


        // Ensure parsedData.data and parsedData.data.productsList exist and are an array
// Access the object under the '0' key first
const actualData = parsedData?.['0'];
const productsList = actualData?.data?.productsList;

        if (Array.isArray(productsList)) {
          console.log(`Found ${productsList.length} products in productsList for ${collection.name || 'Unnamed'} (ID: ${collection._id}).`);

          const productsWithCollection = productsList.map(product => ({
            ...product,
            collectionName: collection.name
          }));

          allCollections.push({
            name: collection.name,
            order: collection.order || 0,
            url: `/collections/${(collection.name || '').toLowerCase().replace(/\s+/g, '-')}`,
            products: productsWithCollection,
          });
          console.log(`Added collection ${collection.name || 'Unnamed'} to allCollections.`);
        } else {
          console.warn(
            `Sanity document ${collection.name || 'Unnamed'} (ID: ${collection._id}) contains invalid or missing productsList. Expected parsedData.data.productsList to be an array. Received:`,
            typeof parsedData, parsedData ? Object.keys(parsedData) : 'null/undefined',
            parsedData?.data ? typeof parsedData.data : 'n/a',
            parsedData?.data?.productsList ? typeof parsedData.data.productsList : 'n/a'
          );
        }
      } catch (e) {
        console.error(
          `Error parsing rawProductJson for ${collection.name || 'Unnamed'} (ID: ${collection._id}):`,
          e.message
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