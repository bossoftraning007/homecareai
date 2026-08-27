import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('Authorization') || ''

    const response = await fetch(`${API_URL}/api/push/subscribe`, {
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
    console.error('Push subscribe error:', error)
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 })
  }
}
