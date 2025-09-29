import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/Style/globals.css";
import Navbar from "@/app/Features/components/navigation/page";

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
  description:
    "Explore our delicious menu featuring rice toppings, sizzlers, soups & noodles, desserts, beverages, and extras. Authentic Filipino flavors that will make your heart skip a beat!",
  icons: {
    icon: "/logo2.png",
    shortcut: "/logo2.png",
    apple: "/logo2.png",
  },
  keywords:
    "Filipino food, restaurant menu, rice toppings, sizzlers, soups, noodles, desserts, beverages, cardiac arrest menu",
  authors: [{ name: "Cardiac Arrest Restaurant" }],
  creator: "Cardiac Arrest Restaurant",
  publisher: "Cardiac Arrest Restaurant",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cardiac-arrest-menu.com"),
  openGraph: {
    title: "Cardiac Arrest Menu - Delicious Filipino Cuisine",
    description:
      "Explore our delicious menu featuring authentic Filipino dishes that will make your heart skip a beat!",
    type: "website",
    locale: "en_US",
    siteName: "Cardiac Arrest Menu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardiac Arrest Menu - Delicious Filipino Cuisine",
    description:
      "Explore our delicious menu featuring authentic Filipino dishes that will make your heart skip a beat!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fbbf24" }],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} `}>
        <div id="root" className="min-h-screen">
          <Navbar />
          {/* Main Content */}
          <main className="flex-1 min-w-0 px-2 sm:px-4 md:px-8 py-4 md:py-8 bg-gradient-to-br from-yellow-600/95 to-yellow-700/95">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
