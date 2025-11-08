import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const llm = !!process.env.OPENAI_API_KEY;
  return NextResponse.json({ llm });
}
