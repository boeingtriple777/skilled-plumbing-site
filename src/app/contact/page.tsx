"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { Phone, Mail, MapPin, MessageSquare, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dppw8lfxp";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* HEADER SPACER: Matches layout logic to push content below the fixed header */}
      <div className="h-20 w-full" />

      {/* HERO & MAIN CONTACT SECTION */}
      <section className="relative bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Text & Contact Info Column */}
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed font-light mb-8">
              Have a question or need a quote? We're here to help. Get in touch and we'll get back to you as soon as possible.
            </p>

            {/* Direct CTA Button */}
            <a 
              href="tel:0448803947"
              className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-md transition duration-200 active:scale-[0.98] mb-10"
            >
              <Phone className="w-5 h-5 fill-current" />
              Call Now: 0448 803 947
            </a>

            {/* Quick Contact Links */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <a 
                href="mailto:ren@skilledplumbingservices.com" 
                className="group flex items-center gap-4 text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Us</span>
                  <span className="text-base font-semibold break-all">ren@skilledplumbingservices.com</span>
                </div>
              </a>

              <div className="flex items-center gap-4 text-slate-600">
                <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Based in Perth</span>
                  <span className="text-base font-medium">Servicing the Perth Metro & surrounding suburbs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="relative h-64 sm:h-[450px] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/60 lg:sticky lg:top-24">
            {/* Swap src string out with the actual Cloudinary ID when ready */}
            <CldImage
              config={{ cloud: { cloudName: cloudName } }}
              src="IMG_ojc9yb" 
              fill
              priority
              alt="Skilled Plumbing Services Team"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-in-out"
              onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
            />
          </div>

        </div>
      </section>

      {/* LOWER CTA BANNER */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
          <div className="flex items-start sm:items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl shrink-0 hidden sm:block">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Need a quote?</h3>
              <p className="text-slate-600 text-sm max-w-md">
                Get a quote tailored to your plumbing needs.
              </p>
            </div>
          </div>
          <Link 
            href="/quote" 
            className="inline-flex items-center gap-2 w-full sm:w-auto justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition duration-200 active:scale-[0.98]"
          >
            Get a Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}