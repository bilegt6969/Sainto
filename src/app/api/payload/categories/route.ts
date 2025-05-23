import { getCategoryUrlsByKey } from '../../../../../lib/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (!key) {
    return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const data = await getCategoryUrlsByKey(key)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error fetching category URLs:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch category URLs' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
