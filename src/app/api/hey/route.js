import { NextResponse } from 'next/server'

// --- IMPORTANT: Using the KicksDB API Key provided. ---
// --- It's highly recommended to store this in an environment variable ---
// --- (e.g., process.env.KICKSDB_API_KEY) instead of hardcoding it. ---
const KICKSDB_API_KEY = 'sd_j2g1pZeImx1tptjgIwpFhQE6vn2AhqG1'; 

// Helper function to fetch with timeout and retries
const fetchWithRetry = async (url, options = {}, retries = 3, timeout = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Workspace failed (${response.status}): ${response.statusText}`, { url, errorBody });
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error // Throw error if all retries fail
      console.warn(`Attempt ${i + 1} failed for ${url}. Retrying...`, error)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds before retrying
    }
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
  }

  // --- KicksDB API URL and Options ---
  const kicksDbUrl = `https://api.kicks.dev/v3/goat/products/${slug}`;
  const options = {
      method: 'GET',
      headers: {
          'Authorization': KICKSDB_API_KEY 
      }
  };

  console.log('Fetching from KicksDB: ' + kicksDbUrl);

  try {
    // --- Fetch main product data from KicksDB ---
    const kicksDbData = await fetchWithRetry(kicksDbUrl, options, 3, 15000);

    // --- Extract Product ID (Adjust based on actual KicksDB response) ---
    // --- Based on your *previous* example, it might be kicksDbData.data.id ---
    const productId = kicksDbData?.data?.id; // <--- CHECK THIS PATH in the actual response

    if (!productId) {
        console.warn("Could not extract 'productId' from KicksDB response. GOAT calls might fail.", kicksDbData);
    }
    
    // --- WARNING: These sections still use GOAT.com ---
    // --- You MUST review the kicksDbData response. If it contains ---
    // --- price/variant/recommendation data, you should REMOVE or ---
    // --- MODIFY these GOAT.com calls. ---

    let PriceData = null;
    try {
      // --- This still uses GOAT. Is this needed? ---
      const PriceTagUrl = `https://www.goat.com/web-api/v1/product_variants/buy_bar_data?productTemplateId=${productId}&countryCode=MN`;
      console.log("Attempting to fetch Price Data (GOAT): " + PriceTagUrl);
      // Only try to fetch if we got a productId
      PriceData = productId ? await fetchWithRetry(PriceTagUrl, {}, 3, 15000) : { error: 'Skipped GOAT Price - No Product ID' };
    } catch (priceError) {
      console.error('Failed to fetch price data (GOAT):', priceError);
      PriceData = { error: 'Failed to fetch price data (GOAT)' };
    }

    let recommendedProducts = [];
    try {
      // --- This still uses GOAT. Is this needed? ---
      const recommendedUrl = `https://www.goat.com/web-api/v1/product_templates/recommended?productTemplateId=${productId}&count=8`;
      console.log("Attempting to fetch Recommended (GOAT): " + recommendedUrl);
      // Only try to fetch if we got a productId
      const recommendedResponse = productId ? await fetchWithRetry(recommendedUrl, {}, 3, 15000) : { productTemplates: [] };
      recommendedProducts = recommendedResponse.productTemplates || []; 
    } catch (recommendedError) {
      console.error('Failed to fetch recommended products (GOAT):', recommendedError);
      recommendedProducts = { error: 'Failed to fetch recommended products (GOAT)' };
    }

    // --- Final Response: Adjust structure based on frontend needs ---
    // It's likely best to adapt your frontend to use the KicksDB response (kicksDbData)
    // and maybe merge PriceData/recommendedProducts if you still need them.
    return NextResponse.json({ 
        data: kicksDbData, // Main data from KicksDB
        PriceData: PriceData, // Price data (from GOAT, if still needed)
        recommendedProducts: recommendedProducts // Recommended (from GOAT, if still needed)
    });

  } catch (err) {
    console.error('Failed to fetch data:', err);
    return NextResponse.json({ error: `Failed to fetch data: ${err.message}` }, { status: 500 });
  }
}