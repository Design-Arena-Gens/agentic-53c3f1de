"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageBubble, type ChatMessage } from './MessageBubble';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [llmEnabled, setLlmEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/status').then((r) => r.json()).then((s) => setLlmEnabled(!!s.llm));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const placeholder = useMemo(() => llmEnabled ? 'Ask me anything...' : 'Try: /search vercel ai sdk | /wiki vercel | /weather London', [llmEnabled]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    const userMessage: ChatMessage = { id: uuid(), role: 'user', content };
    setMessages((m) => [...m, userMessage]);
    setInput('');
    setPending(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })) }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => 'Request failed');
      setMessages((m) => [...m, { id: uuid(), role: 'assistant', content: `Error: ${errText}` }]);
      setPending(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = '';
    const assistantId = uuid();
    setMessages((m) => [...m, { id: assistantId, role: 'assistant', content: '' }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      assistantText += chunk;
      setMessages((m) => m.map((msg) => msg.id === assistantId ? { ...msg, content: assistantText } : msg));
    }

    setPending(false);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="container">
      {!llmEnabled && (
        <div className="system-banner">
          LLM not configured. Tool commands available: /search, /wiki, /weather.
        </div>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={scrollRef} />

      <form className="input-row" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
        />
        <button className="button" disabled={pending}>
          {pending ? 'Sending?' : 'Send'}
        </button>
      </form>
    </div>
  );
}
