import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-condensed",
});

import { getStoreConfig } from "@/lib/admin/store-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  const storeName = config.storeName || "LeagueSports";

  /* MetadataBase é crucial para resolver URLs relativas em tags OG */
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
    : new URL("https://leaguesports.com.br");

  return {
    metadataBase: baseUrl,
    title: {
      template: `%s | ${storeName}`,
      default: storeName,
    },
    description: `Sua loja oficial ${storeName}. Os melhores artigos esportivos.`,
    icons: {
      icon: config.logoUrl || "/favicon.ico",
    },
    openGraph: {
      title: storeName,
      description: `Confira as ofertas da ${storeName}`,
      url: baseUrl,
      siteName: storeName,
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: config.logoUrl || "/og-image.jpg", // Idealmente ter uma imagem padrão OG
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: `Confira as ofertas da ${storeName}`,
      images: [config.logoUrl || "/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="antialiased font-body overflow-x-hidden min-w-0" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
