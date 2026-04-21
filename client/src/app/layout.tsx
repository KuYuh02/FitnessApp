import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitTrack',
  description: 'Track your workouts and PRs',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}