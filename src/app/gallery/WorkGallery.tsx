"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from "framer-motion";

export interface GalleryPhoto {
  src: string;
  width: number;
  height: number;
}

export default function WorkGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = useState(-1);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dppw8lfxp";

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
      <div className="h-24" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div 
          variants={container} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-50px" }}
          // 1. Replaced PhotoAlbum with a standard, perfectly uniform CSS Grid
className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"        >
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.src}
              variants={item}
              onClick={() => setIndex(idx)}
              // 2. aspect-square forces every thumbnail to be identical in size
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] cursor-pointer bg-white"
            >
              {/* 3. Using 'fill' and 'object-cover' ensures the image perfectly fills the square without stretching */}
              <CldImage
                config={{ cloud: { cloudName: cloudName } }}
                src={photo.src}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt="Skilled Plumbing Work"
                // Adding crop="fill" and gravity="auto" lets Cloudinary's AI center the thumbnail on the most important part of the photo (like the stove dials)!
                crop="fill"
                gravity="auto"
                className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105"
                onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                View Full Size →
              </div>
            </motion.div>
          ))}
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
          <a href="/quote" className="flex w-full justify-center items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl font-medium tracking-wide transition-all duration-300 hover:bg-slate-800 active:scale-95 backdrop-blur-md">
            <span>Get a Free Quote</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Lightbox remains completely unchanged so the user sees the original aspect ratio when they click! */}
      <Lightbox
        slides={photos.map((p: GalleryPhoto) => ({
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