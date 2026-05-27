import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  title: "Plumber Perth | Skilled Plumbing Services",
  description:
    "Perth's trusted local plumber, based in Fremantle. Serving the southern suburbs and all of Perth, WA. Honest, reliable plumbing and gas fitting. Free site visits and quotes.",
  openGraph: {
    title: "Plumber Perth | Skilled Plumbing Services",
    description:
      "Perth's trusted local plumber, based in Fremantle. Serving the southern suburbs and all of Perth, WA. Honest, reliable plumbing and gas fitting. Free site visits and quotes.",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Plumber",
  name: "Skilled Plumbing Services",
  url: "https://skilledplumbingservices.com",
  image: "https://skilledplumbingservices.com/og-image.png",
  description:
    "Licensed plumber serving Fremantle, southern suburbs and all of Perth, WA. Hot water systems, gas fitting, blocked drains, renovations and more. Licence PL11063 | GF20308.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Fremantle",
    addressRegion: "WA",
    postalCode: "6160",
    addressCountry: "AU",
  },
  areaServed: [
    "Fremantle",
    "North Fremantle",
    "South Fremantle",
    "East Fremantle",
    "Beaconsfield",
    "O'Connor",
    "Willagee",
    "Hilton",
    "White Gum Valley",
    "Samson",
    "Hamilton Hill",
    "Spearwood",
    "Coolbellup",
    "Bibra Lake",
    "Henderson",
    "Success",
    "Coogee",
    "Cockburn Central",
    "Canning Vale",
    "Murdoch",
    "Kardinya",
    "Melville",
    "Myaree",
    "Booragoon",
    "Applecross",
    "Mount Pleasant",
    "Attadale",
    "Bicton",
    "Palmyra",
    "Mosman Park",
    "Cottesloe",
    "Nedlands",
    "Claremont",
    "South Perth",
    "Perth",
  ],
  priceRange: "$$",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Plumbing & Gas Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hot Water System Repairs & Replacement" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Gas Fitting & Appliance Installation" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Blocked Drains" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Leaking Taps" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Burst Pipe Repairs" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home Renovations & Extensions" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reticulation Repairs" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial Plumbing" } },
    ],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <HomeContent />
    </>
  );
}
