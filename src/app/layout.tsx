import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GambleGuard | Break Free from Gambling",
  description: "Your AI-powered guardian against gambling urges. Track your savings, visualize investment potential, and build real wealth instead of losing it to chance.",
  keywords: ["gambling addiction", "financial wellness", "investment tracker", "money management", "gambling prevention", "wealth building"],
  authors: [{ name: "GambleGuard" }],
  creator: "GambleGuard",
  publisher: "GambleGuard",
  applicationName: "GambleGuard",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://gambleguard.app",
    siteName: "GambleGuard",
    title: "GambleGuard | Break Free from Gambling",
    description: "Your AI-powered guardian against gambling urges. Build real wealth instead of losing it to chance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GambleGuard - Your Financial Guardian",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GambleGuard | Break Free from Gambling",
    description: "Your AI-powered guardian against gambling urges.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#020617" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#020617]`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
