import type { Metadata } from "next";
import "./globals.css"; 
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://skilledplumbingservices.com"),
  title: {
    default: "Plumber Perth | Skilled Plumbing Services",
    template: "%s | Skilled Plumbing Services",
  },
  description:
    "Licensed plumber serving Fremantle, southern suburbs and all of Perth, WA. Expert plumbing and gas fitting — hot water systems, blocked drains, renovations and more. Free quotes.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Plumber Perth | Skilled Plumbing Services",
    description:
      "Licensed plumber serving Fremantle, southern suburbs and all of Perth, WA. Expert plumbing and gas fitting — hot water systems, blocked drains, renovations and more. Free quotes.",
    url: "https://skilledplumbingservices.com",
    siteName: "Skilled Plumbing Services",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
    locale: "en_AU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAFAFA]">
        <Navbar />
   
<main >         
   {children}
        </main>
      </body>
    </html>
  );
}