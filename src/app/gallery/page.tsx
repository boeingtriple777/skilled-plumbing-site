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

    <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
  <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
    
    {/* Branding Group */}
    <div className="flex items-center gap-4">
      <img 
        src="/logo.png" 
        alt="Skilled Plumbing Logo" 
        className="h-10 md:h-12 w-auto object-contain" 
      />
      <div className="flex flex-col border-l border-slate-200 pl-4">
        <span className="text-sm font-bold tracking-tight text-slate-800">OUR WORK</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">OLD SCHOOL CRAFTSMANSHIP</span>
      </div>
    </div>

    {/* Navigation */}
    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
      <a href="#work" className="hover:text-slate-900 transition-colors">Portfolio</a>
      <a href="tel:+61" className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs hover:bg-slate-800 transition-all">
        Call Ren
      </a>
    </div>
    
  </div>
</header>
      
      {/* Hero Section */}
      

      {/* Gallery */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
         <PhotoAlbum
  layout="masonry"
  photos={photos}
  // 1 column on mobile, 2 on tablet, 3 on desktop
  columns={(containerWidth) => {
    if (containerWidth < 640) return 1; 
    if (containerWidth < 1024) return 2;
    return 3; 
  }}
  // Tighter spacing on mobile so it doesn't look disjointed
  spacing={(containerWidth) => (containerWidth < 640 ? 16 : 24)}
  onClick={({ index }) => setIndex(index)}
  render={{
    // ... keep your existing render code here
             wrapper: ({ style, onClick }) => (
  <motion.div
    variants={item}
    style={style}
    onClick={onClick}
              
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] cursor-pointer bg-white"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Hover Label */}
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
     {/* Floating CTA with 5-second delay */}
<motion.div
  initial={{ opacity: 0, y: 100, x: "-50%" }} // Start hidden and below the screen
  animate={{ opacity: 1, y: 0 }}               // Slide up and fade in
  transition={{ 
    delay: 10,                                 // The 5-second wait
    duration: 0.8, 
    ease: "easeOut" 
  }}
  className="fixed bottom-6 md:bottom-8 left-1/2 z-40 w-[60%] md:w-auto max-w-sm"
>
  {/* Nested motion div for the continuous floating "bounce" effect */}
  <motion.div
    animate={{ y: [0, -4, 0] }}
    transition={{ 
      repeat: Infinity, 
      duration: 3, 
      delay: 5.8 // Starts after the entrance animation finishes
    }}
  >
    <a
      href="tel:+61"
      className="flex w-full justify-center items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl font-medium tracking-wide transition-all duration-300 hover:bg-slate-800 active:scale-95 backdrop-blur-md"
    >
      <span>Get a Free Quote</span>
    </a>
  </motion.div>
</motion.div>

      {/* Lightbox */}
      <Lightbox
        slides={photos.map((p) => ({
          src: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/${p.src}`,
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