import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Agentic - Your Web Agent',
  description: 'A simple agent that can search, fetch Wikipedia, and check weather.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-3xl mx-auto p-4">
          <header className="py-6">
            <h1 className="text-2xl font-semibold">Agentic</h1>
            <p className="text-sm text-gray-600">Ask anything. Try normal questions or commands like /search, /wiki, /weather.</p>
          </header>
          <main>{children}</main>
          <footer className="py-8 text-center text-xs text-gray-500">Built for Vercel</footer>
        </div>
      </body>
    </html>
  );
}
