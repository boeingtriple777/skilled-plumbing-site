import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Skilled Plumbing Services",
  description: "Professional plumbing services",

  icons: {
    icon: "/favicon.svg",
  },

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