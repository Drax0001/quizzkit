import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeTokens } from "@/components/theme-tokens";
import { Providers } from "@/components/providers";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { domain } from "@/config/domain.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: domain.brand.name,
    template: `%s · ${domain.brand.name}`,
  },
  description: domain.brand.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeTokens />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <RegisterServiceWorker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
