import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { salon } from "@/lib/salon.config";
import "./globals.css";

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${salon.name} — Book Online`,
    template: `%s · ${salon.name}`,
  },
  description: salon.description,
  icons: {
    // ?v= busts browser/CDN cache of the old Vercel triangle
    icon: [
      { url: "/images/favicon-32.png?v=ranu3", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-48.png?v=ranu3", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico?v=ranu3", sizes: "any" },
    ],
    apple: [{ url: "/images/favicon-180.png?v=ranu3", sizes: "180x180", type: "image/png" }],
    shortcut: "/images/favicon-32.png?v=ranu3",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
