import type { Metadata } from "next";
import "./globals.css";
import ClientComponent from "./clientLayout";
import { CSPostHogProvider } from './providers';

// Fonts: AnyStore uses the local system font stack (see globals.css --font-system).
// next/font/google was removed so builds never fetch fonts from the network.

export const metadata: Metadata = {
  title: "AnyStore",
  description: "Drop anything. Find it later by asking like a person.",
  icons: {
    icon: [
      { url: '/anystore-mark.svg', sizes: 'any' },
    ],
  },
  openGraph: {
    title: "AnyStore",
    description: "Drop anything. Find it later by asking like a person.",
  },
  twitter: {
    card: 'summary',
    title: "AnyStore",
    description: "Drop anything. Find it later by asking like a person.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <CSPostHogProvider>
          <ClientComponent>
            {children}
          </ClientComponent>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
