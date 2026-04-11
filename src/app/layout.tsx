import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://skilledplumbingservices.com"),
  title: "Skilled Plumbing Services",
  description: "Professional plumbing services",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Skilled Plumbing Services",
    description: "Professional plumbing services",
    url: "https://skilledplumbingservices.com",
    siteName: "Skilled Plumbing Services",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}