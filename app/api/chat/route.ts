import { NextResponse } from 'next/server';
import { llmRespond, type LLMMessage } from '@/lib/llm';
import { toolSearch } from '@/lib/tools/search';
import { toolWikipedia } from '@/lib/tools/wikipedia';
import { toolWeather } from '@/lib/tools/weather';

export const runtime = 'edge';

function streamFromString(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function parseToolCommand(content: string): { tool: 'search'|'wiki'|'weather'; arg: string } | null {
  const trimmed = content.trim();
  const match = /^\/(search|wiki|weather)\s+(.+)/i.exec(trimmed);
  if (!match) return null;
  return { tool: match[1].toLowerCase() as any, arg: match[2].trim() };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body?.messages ?? []) as LLMMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return new NextResponse('Invalid messages', { status: 400 });
    }
    const last = messages[messages.length - 1];

    const toolCmd = parseToolCommand(last.content || '');
    if (toolCmd) {
      let out = '';
      if (toolCmd.tool === 'search') out = await toolSearch(toolCmd.arg);
      else if (toolCmd.tool === 'wiki') out = await toolWikipedia(toolCmd.arg);
      else if (toolCmd.tool === 'weather') out = await toolWeather(toolCmd.arg);
      const stream = streamFromString(out);
      return new NextResponse(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const stream = await llmRespond(messages);
    if (stream) {
      return new NextResponse(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const help = `LLM not configured. Available commands:\n\n` +
      `- /search <query>\n` +
      `- /wiki <topic>\n` +
      `- /weather <place>`;
    return new NextResponse(streamFromString(help), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (e: any) {
    return new NextResponse(`Server error: ${e?.message ?? 'unknown'}`, { status: 500 });
  }
}
