import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@/app/Style/globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cardiac Arrest Menu - Delicious Filipino Cuisine",
  description: "Explore our delicious menu featuring rice toppings, sizzlers, soups & noodles, desserts, beverages, and extras. Authentic Filipino flavors that will make your heart skip a beat!",
  keywords: "Filipino food, restaurant menu, rice toppings, sizzlers, soups, noodles, desserts, beverages, cardiac arrest menu",
  authors: [{ name: "Cardiac Arrest Restaurant" }],
  creator: "Cardiac Arrest Restaurant",
  publisher: "Cardiac Arrest Restaurant",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cardiac-arrest-menu.com'),
  openGraph: {
    title: "Cardiac Arrest Menu - Delicious Filipino Cuisine",
    description: "Explore our delicious menu featuring authentic Filipino dishes that will make your heart skip a beat!",
    type: "website",
    locale: "en_US",
    siteName: "Cardiac Arrest Menu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardiac Arrest Menu - Delicious Filipino Cuisine",
    description: "Explore our delicious menu featuring authentic Filipino dishes that will make your heart skip a beat!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fec401' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1e1e' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
