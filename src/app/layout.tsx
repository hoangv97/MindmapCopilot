import { ThemeProvider } from '@/components/theme-provider';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mindmap Copilot',
  description: 'Your copilot for the Mindmap app',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <CopilotKit url="/api/copilotkit/openai">
            <CopilotSidebar
              labels={{
                initial:
                  'Welcome to the Mindmap Copilot app! How can I help you?',
              }}
            >
              {children}
            </CopilotSidebar>
          </CopilotKit>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
