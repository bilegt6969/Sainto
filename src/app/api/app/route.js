// app/api/products/route.js

import { NextResponse } from 'next/server';
import { getCollections } from '../../../../lib/api';

/**
 * Handles GET requests to the API endpoint.
 * Fetches product search results from the GOAT API and returns them.
 *
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} A JSON response containing the product data or an error message.
 */
export async function GET() {
  let apiUrl = null; // Declare apiUrl outside to ensure it's accessible in all scopes

  // --- Step 1: Determine the API URL ---
  try {
    // Attempt to get the API URL from collections first
    const collections = await getCollections();

    // Check if collections exist and contain a valid URL
    if (collections && collections.length > 0 && collections[0].url) {
      apiUrl = collections[0].url;
    } else {
      // If collections are empty or don't provide a valid URL, log a warning
      console.warn('getCollections did not return a valid URL. Using default GOAT API URL as fallback.');
      // Fallback to a hardcoded GOAT API URL if collections didn't provide one
      // IMPORTANT: Replace this placeholder with your actual default GOAT API URL
      apiUrl = 'https://api.goat.com/v1/products/search'; 
    }
  } catch (collectionsError) {
    // If fetching collections fails entirely, log the error
    console.error('Error fetching collections:', collectionsError);
    // Fallback to a hardcoded GOAT API URL in case of an error fetching collections
    // IMPORTANT: Replace this placeholder with your actual default GOAT API URL
    apiUrl = 'https://api.goat.com/v1/products/search'; 
  }

  // --- Step 2: Validate the determined API URL ---
  // If after all attempts, apiUrl is still null, it means we couldn't get a valid URL
  if (!apiUrl) {
    console.error('Failed to determine a valid API URL for product data.');
    return NextResponse.json(
      { message: 'Internal Server Error', error: 'Could not determine API URL for product data.' },
      { status: 500 }
    );
  }

  // --- Step 3: Fetch data from the determined API URL ---
  try {
    // Fetch data from the external API using the determined apiUrl
    const response = await fetch(apiUrl, {
      headers: {    
        'Content-Type': 'application/json',
        'User-Agent': 'YourAppName/1.0' // Good practice to identify your application
      },
      cache: 'no-store' // Ensures fresh data, as you intended
    });

    // Check if the HTTP response was successful (status code 200-299)
    if (!response.ok) {
      const errorText = await response.text(); // Get detailed error message from response body
      throw new Error(`Failed to fetch data from external API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Parse the JSON response body
    const data = await response.json();

    // Return the fetched data as a JSON response with a 200 OK status
    return NextResponse.json(data, { status: 200 });

  } catch (apiError) {
    // Catch any errors that occur during the fetch operation (e.g., network errors, JSON parsing errors)
    console.error('Error fetching product data from GOAT API:', apiError);

    // Return an error response to the client
    return NextResponse.json(
      { message: 'Internal Server Error', error: apiError.message },
      { status: 500 }
    );
  }
}
