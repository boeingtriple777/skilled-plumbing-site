"use client";

import Link from 'next/link';
import { CldImage } from "next-cloudinary";
import { CheckCircle, ArrowRight, Wrench, Droplet, Flame, HomeIcon, Construction, Settings } from 'lucide-react';
import { photos } from "@/data/photos";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


export default function HomePage() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dppw8lfxp";

  // Helper to grab a specific photo object by its src ID from your photos.ts
  const getPhoto = (id: string) => photos.find(p => p.src === id) || photos[0];

  const services = [
    {
      title: "Home Renovations & Extensions",
      desc: "Complete plumbing overhauls for your new space and kitchen/bathroom extensions.",
      imageId: "IMG_1969_mxa5nx", // Tiled bathroom/renovation vibe
      icon: <HomeIcon className="w-6 h-6" />
    },
    {
      title: "Leaking Taps",
      desc: "Quick, reliable fixes to save water and prevent property damage.",
      imageId: "leaking_tap_hi7bb5",
      icon: <Droplet className="w-6 h-6" />
    },
    {
      title: "Gas Fitting",
      desc: "Safe, certified gas installations and leak detection for your peace of mind.",
      imageId: "stove1_lxmx0r",
      icon: <Flame className="w-6 h-6" />
    },
    {
      title: "Hot Water Systems",
      desc: "Repairs, replacements, and upgrades to ensure you're never without hot water.",
      imageId: "hotty3_gsobsn",
      icon: <Settings className="w-6 h-6" />
    },
    {
      title: "Blocked Drains",
      desc: "Specialized equipment to clear stubborn blockages and prevent future issues.",
      imageId: "IMG_1194_cvyz0e",
      icon: <Wrench className="w-6 h-6" />
    },
    {
      title: "Commercial Plumbing",
      desc: "High-capacity gas fitting and plumbing solutions for local Perth businesses.",
      imageId: "commerical_gzrzhn",
      icon: <Construction className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center bg-slate-900 text-white overflow-hidden">
        {/* TOP SPACER: Matches your Gallery page logic to clear the fixed header */}
        <div className="absolute top-0 left-0 right-0 h-24 z-30" />

        <div className="absolute inset-0 z-0">
          <CldImage
            config={{ cloud: { cloudName: cloudName } }}
            src="IMG_0746_3_zk87u4" 
            fill
            priority
            alt="Skilled Plumbing Services Hero"
            sizes="100vw"
            className="object-cover opacity-0 transition-opacity duration-1000 ease-in-out"
            onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent z-10" />
          {/* Mobile-specific bottom fade to ensure text contrast on small screens */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden z-10" />
        </div>

        {/* pt-40 on mobile ensures the text starts well below the 24-unit header */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-40 pb-20 lg:pt-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Old School <span className="text-blue-400">Service.</span>
            </h1>
            <p className="text-xl lg:text-2xl font-light text-slate-200 mb-10 leading-relaxed max-w-xl">
              Built on <span className="font-semibold text-white">Trust, Honesty, and Integrity.</span> 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/gallery" className="inline-flex justify-center items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-xl transition duration-300 active:scale-95">
                View Our Work
              </Link>
              <Link href="/our-services" className="inline-flex justify-center items-center bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-10 rounded-xl backdrop-blur-md transition duration-300 border border-white/20 active:scale-95">
                Our Services
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs sm:text-sm font-medium text-slate-00 uppercase tracking-wider">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> Free Quotes & Site Visits</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> Transparent Processes From Start to Finish</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> Only quality work completed to Australian Standards (AS/NZS 3500 & 5601)</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* CORE SERVICES GRID */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">What we do</h2>
            <h3 className="text-4xl font-bold text-slate-900 leading-tight">Proffesional Plumbing & Gas Solutions</h3>
          </div>
          <Link href="/our-services" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
            View All Services <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const photo = getPhoto(service.imageId);
            return (
              <div key={idx} className="group bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                <div className="h-64 relative overflow-hidden bg-slate-100">
                  <CldImage
                    config={{ cloud: { cloudName: cloudName } }}
                    src={service.imageId}
                    fill
                    alt={service.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-0"
                    onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 z-20 text-white p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    {service.icon}
                  </div>
                </div>
                
                <div className="p-8">
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {service.desc}
                  </p>
                  <Link href={`/our-services#${service.title.toLowerCase().replace(/ /g, '-')}`} className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Mobile-only Link */}
        <div className="mt-12 md:hidden text-center">
          <Link href="/our-services" className="inline-flex items-center gap-2 text-blue-600 font-bold">
            See all our services <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

       {/* Floating CTA */}
      <motion.div
        initial={{ opacity: 0, y: 100, x: "-50%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 7, duration: 0.8, ease: "easeOut" }}
        className="fixed bottom-6 md:bottom-8 left-1/2 z-40 w-[60%] md:w-auto max-w-sm"
      >
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 10.8 }}>
          <a href="/quote" className="flex w-full justify-center items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-full shadow-2xl font-medium tracking-wide transition-all duration-300 hover:bg-slate-800 active:scale-95 backdrop-blur-md">
            <span>Get a Free Quote</span>
          </a>
        </motion.div>
      </motion.div>

      {/* FOOTER CALL TO ACTION */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Need a site visit or a quote?</h2>
          <p className="text-slate-400 mb-10 text-lg">We provide upfront, transparent advice and obligation-free quoting for all plumbing and gas work.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quote" className="bg-white text-slate-900 hover:bg-blue-50 font-bold py-4 px-10 rounded-xl transition duration-300">
              Request Your Quote
            </Link>
           
          </div>
        </div>
      </section>

    </div>
  );
}