import { memo } from 'react';

export type Role = 'user' | 'assistant' | 'system';
export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export const MessageBubble = memo(function MessageBubble({ message }: { message: ChatMessage }) {
  const roleClass = message.role === 'user' ? 'user' : message.role === 'assistant' ? 'assistant' : '';
  return (
    <div className={`message ${roleClass}`}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{message.role}</div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
    </div>
  );
});
