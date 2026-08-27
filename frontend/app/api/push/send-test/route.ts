import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') || ''

    const response = await fetch(`${API_URL}/api/push/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({}),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Push test error:', error)
    return NextResponse.json({ success: false, message: 'Failed' }, { status: 500 })
  }
}
