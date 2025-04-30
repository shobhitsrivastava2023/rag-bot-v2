import { NextResponse } from 'next/server'

const CORRECT_PASSCODE = process.env.AUTH_PASSCODE 

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json()

    if (!passcode) {
      return NextResponse.json(
        { error: 'Passcode is required' },
        { status: 400 }
      )
    }

    if (passcode !== CORRECT_PASSCODE) {
      return NextResponse.json(
        { error: 'Invalid passcode' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}