"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { CheckCircle2, Siren, Home, Wrench, Flame, ArrowRight } from "lucide-react";

export default function ServicesPage() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dppw8lfxp";

  // Grouped the raw list into logical, customer-friendly categories
  const categories = [
    
      {
      id: "installations-renovations",
      title: "Renovations & Home Extensions",
      desc: "From minor bathroom updates to complete structural plumbing for new builds. We work with you to ensure perfect placement and flawless finishes.",
      imageId: "IMG_1969_mxa5nx", 
      icon: <Home className="w-6 h-6" />,
      services: [
        "Vanity Hanging & Installation",
        "Home Renovations", 
        "Extensions & Additions", 
        "Wall Chasing & Concrete Cutting", 
        
      ]
    },
    
    {
      id: "emergency-blockages",
      title: "Blocked Drains",
      desc: "Fast, reliable response when you need it most. We use specialized equipment to clear stubborn blockages and secure burst pipes to prevent property damage.",
      imageId: "IMG_0729_ccrlrv", 
      icon: <Siren className="w-6 h-6" />,
      services: [
          "Blocked Toilets",
          "Blocked Showers",
          "Blocked Basins",
          "Blocked Sinks",
      ]
    },
  
    {
      id: "general-maintenance",
      title: "Hot Water, Maintenance & General Repairs",
      desc: "Don't let minor leaks turn into major headaches. We handle all the day-to-day plumbing fixes to keep your home running efficiently.",
      imageId: "general_repairs_1_aoxt4g", 
      icon: <Wrench className="w-6 h-6" />,
      services: [
        "Leaking Taps", 
        "General Tap & Tapware Repairs", 
        "Toilet Repairs & Replacements", 
        "Reticulation (Retic) Repairs",
        "Hot Water System Repairs, Replacement & Servicing",
        "Burst Pipe Repairs"
      ]
    },
    {
      id: "gas-hot-water",
      title: "Gas Fitting",
      desc: "Gas can be dangerous if appliances are not installed appropriately and by a qualified gas fitter. We install ALL gas appliances as per the manufacturer's guidelines and the Australian standards. This ensures that every single customer is safe when using their new appliance and can have absolute peace of mind that no corners were cut in the process.",
      imageId: "gas5_zvufds", 
      icon: <Flame className="w-6 h-6" />,
      services: [
        "Hot Water Systems (Install & Repair)", 
        "General Gas Fitting", 
        "Gas Meter Relocations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* PAGE HEADER */}
      <section className="relative pt-40 pb-20 bg-slate-900 text-white overflow-hidden">
        {/* Header Background */}
        <div className="absolute inset-0 z-0 opacity-100">
          <CldImage
            config={{ cloud: { cloudName: cloudName } }}
            src="IMG_0746_3_zk87u4" // A good wide installation shot
            fill
            priority
            alt="Skilled Plumbing Services"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Comprehensive <span className="text-blue-500">Plumbing Solutions.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            From dripping taps to complete commercial fit-outs. We bring old-school service and transparent pricing to every job, big or small.
          </p>
        </div>
      </section>

      {/* SERVICES LIST (Alternating Layout) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-24 md:space-y-32">
          {categories.map((category, index) => {
            // Determine if the image should be on the left or right
            const isEven = index % 2 === 0;

            return (
              <div 
                key={category.id} 
                id={category.id}
                className={`flex flex-col gap-12 lg:gap-20 items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative">
                  {/* Decorative background shape */}
                  <div className={`absolute top-4 bottom-4 w-full bg-blue-100 rounded-3xl -z-10 ${isEven ? 'left-4' : 'right-4'}`} />
                  
                  <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white">
                    <CldImage
                      config={{ cloud: { cloudName: cloudName } }}
                      src={category.imageId}
                      fill
                      alt={category.title}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg text-blue-600">
                      {category.icon}
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                    {category.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                    {category.desc}
                  </p>

                  {/* Specific Services Grid */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-6">Specialities</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      {category.services.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-slate-800 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Quick CTA per section */}
                  <div className="mt-8">
                    <Link href="/quote" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors group">
                      Need help with this? Get a quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Don't see exactly what you need?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
            Plumbing issues rarely fit neatly into a box. If you have a custom project or an unusual problem, reach out. We can handle it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote" className="bg-white text-blue-700 hover:bg-slate-50 font-bold py-4 px-10 rounded-xl shadow-xl transition duration-300 active:scale-95">
              Request a Free Quote
            </Link>
              </div>
        </div>
      </section>

    </div>
  );
}