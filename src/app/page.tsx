"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import PhotoAlbum from "react-photo-album";
import type { RenderImageProps, RenderImageContext } from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { motion } from "framer-motion";
import { photos } from "@/data/photos";

export default function WorkGallery() {
  const [index, setIndex] = useState(-1);

  // FALLBACK: This ensures the app doesn't crash if the env variable isn't baked in yet
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dppw8lfxp";

  // Animation configs
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-24">
      {/* Sticky Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
  <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
    
    {/* Branding */}
    <div className="flex items-center gap-3 md:gap-4">
      <img src="/logo.png" alt="Skilled Plumbing Logo" className="h-10 md:h-12 w-auto object-contain" />
      <div className="flex flex-col border-l border-slate-200 pl-3 md:pl-4">
              <span className="text-sm font-bold tracking-tight text-slate-800">OUR WORK</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">OLD SCHOOL CRAFTSMANSHIP</span>
      </div>
    </div>

    {/* CTA Section */}
    <div className="flex items-center gap-4">
      <a 
        href="tel:+61448803947" 
        className="bg-slate-900 text-white p-2.5 md:px-5 md:py-2 rounded-full text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-lg flex items-center gap-2"
      >
        {/* Lucide Phone icon for mobile, text hidden on small screens */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span className="hidden md:inline">Call Ren</span>
      </a>
    </div>
  </div>
</header>

      {/* Gallery Spacer (To prevent header overlap) */}
      <div className="h-24" />

      {/* Gallery */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
          <PhotoAlbum
            layout="masonry"
            photos={photos}
            columns={(containerWidth) => {
              if (containerWidth < 640) return 1;
              if (containerWidth < 1024) return 2;
              return 3;
            }}
            spacing={(containerWidth) => (containerWidth < 640 ? 16 : 24)}
            onClick={({ index }) => setIndex(index)}
            render={{
              wrapper: ({ style, onClick }) => (
                <motion.div
                  variants={item}
                  style={style}
                  onClick={onClick}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] cursor-pointer bg-white"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 text-white text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    View Project →
                  </div>
                </motion.div>
              ),
              image: (
                { alt, sizes, className, onClick }: RenderImageProps,
                { photo, width, height }: RenderImageContext
              ) => (
                <CldImage
                  // Explicitly tell the component which cloud to use
                  config={{ cloud: { cloudName: cloudName } }}
                  src={photo.src}
                  width={width}
                  height={height}
                  alt={alt || "Skilled Plumbing Work"}
                  sizes={sizes}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  style={{ width: "100%", height: "auto" }}
                  className={`${className} opacity-0 transition-all duration-700 ease-out group-hover:scale-105`}
                  onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                  onClick={onClick}
                />
              ),
            }}
          />
        </motion.div>
      </div>

      {/* Floating CTA */}
      <motion.div
        initial={{ opacity: 0, y: 100, x: "-50%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 10, duration: 0.8, ease: "easeOut" }}
        className="fixed bottom-6 md:bottom-8 left-1/2 z-40 w-[60%] md:w-auto max-w-sm"
      >
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 10.8 }}>
          <a href="tel:+61" className="flex w-full justify-center items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl font-medium tracking-wide transition-all duration-300 hover:bg-slate-800 active:scale-95 backdrop-blur-md">
            <span>Get a Free Quote</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Lightbox - Using the fallback cloudName */}
      <Lightbox
        slides={photos.map((p) => ({
          src: `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${p.src}`,
        }))}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        styles={{
          container: {
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          },
        }}
      />
    </div>
  );
}