import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get Authorization header from client
    const authHeader = request.headers.get('Authorization') || ''

    // Forward to backend with auth header
    const response = await fetch(`${API_URL}/api/push/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Push broadcast proxy error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send push notifications' },
      { status: 500 }
    )
  }
}
