import type { Metadata } from "next";
import QuoteContent from "./QuoteContent";

export const metadata: Metadata = {
  title: "Free Quote | Skilled Plumbing Services Perth",
  description:
    "Request a free plumbing or gas fitting quote. Serving Fremantle, Cockburn, Melville and all Perth suburbs. Fast response, upfront transparent pricing.",
  openGraph: {
    title: "Free Quote | Skilled Plumbing Services Perth",
    description:
      "Request a free plumbing or gas fitting quote. Serving Fremantle, Cockburn, Melville and all Perth suburbs. Fast response, upfront transparent pricing.",
  },
};

export default function Page() {
  return <QuoteContent />;
}
