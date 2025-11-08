export type LLMMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function llmRespond(messages: LLMMessage[]): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = `You are an agent with access to tools. If you cannot browse, instruct users to try /search, /wiki, or /weather commands.`;

  const body = {
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  } as const;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    return null;
  }

  // Pass through the SSE stream as plain text chunks (strip event framing)
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const reader = res.body.getReader();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const text = decoder.decode(value, { stream: true });
      const lines = text.split(/\n/).filter(Boolean);
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (typeof delta === 'string' && delta.length > 0) {
              controller.enqueue(encoder.encode(delta));
            }
          } catch {}
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
