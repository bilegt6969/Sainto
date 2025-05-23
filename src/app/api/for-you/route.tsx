import { NextResponse } from 'next/server'

interface ExternalProduct {
  data: {
    id: string
    image_url: string
    gp_lowest_price_cents_223?: number
    gp_instant_ship_lowest_price_cents_223?: number
    product_condition: string
    box_condition: string
    slug?: string
  }
  value: string
}

interface ExternalApiResponse {
  response: {
    results: ExternalProduct[]
    total_num_results: number
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'

  try {
    const apiUrl = `https://ac.cnstrc.com/browse/group_id/all?c=ciojs-client-2.54.0&key=key_XT7bjdbvjgECO5d8&i=c1a92cc3-02a4-4244-8e70-bee6178e8209&s=86&page=${page}&num_results_per_page=24&sort_by=relevance&sort_order=descending&fmt_options%5Bhidden_fields%5D=gp_lowest_price_cents_223&fmt_options%5Bhidden_fields%5D=gp_instant_ship_lowest_price_cents_223&fmt_options%5Bhidden_facets%5D=gp_lowest_price_cents_223&fmt_options%5Bhidden_facets%5D=gp_instant_ship_lowest_price_cents_223&variations_map=%7B%22group_by%22%3A%5B%7B%22name%22%3A%22product_condition%22%2C%22field%22%3A%22data.product_condition%22%7D%2C%7B%22name%22%3A%22box_condition%22%2C%22field%22%3A%22data.box_condition%22%7D%5D%2C%22values%22%3A%7B%22min_regional_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.gp_lowest_price_cents_223%22%7D%2C%22min_regional_instant_ship_price%22%3A%7B%22aggregation%22%3A%22min%22%2C%22field%22%3A%22data.gp_instant_ship_lowest_price_cents_223%22%7D%7D%2C%22dtype%22%3A%22object%22%7D&qs=%7B%22features%22%3A%7B%22display_variations%22%3Atrue%7D%2C%22feature_variants%22%3A%7B%22display_variations%22%3A%22matched%22%7D%7D&_dt=${Date.now()}`

    const res = await fetch(apiUrl)
    if (!res.ok) {
      throw new Error(`External API failed with status: ${res.status}`)
    }

    const data: ExternalApiResponse = await res.json()

    if (!data.response?.results) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 500 })
    }

    const products = data.response.results.map((item) => ({
      id: item.data.id,
      name: item.value,
      image: item.data.image_url,
      price: item.data.gp_lowest_price_cents_223 ? item.data.gp_lowest_price_cents_223 / 100 : 0,
      instantShipPrice: item.data.gp_instant_ship_lowest_price_cents_223
        ? item.data.gp_instant_ship_lowest_price_cents_223 / 100
        : null,
      productCondition: item.data.product_condition,
      boxCondition: item.data.box_condition,
      slug: item.data.slug || item.data.id,
    }))

    return NextResponse.json({
      products,
      hasMore: data.response.results.length > 0,
      total: data.response.total_num_results,
    })
  } catch (error: unknown) {
    console.error('Error in products API route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
