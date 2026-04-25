"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Get a Quote", href: "/quote" },
    { name: "Our Work", href: "/gallery" },
    { name: "Our Services", href: "/our-services" },
    //{ name: "About Us", href: "/about" },
    { name: "Links", href: "/links" },
  ];

  // Filter out the current page so we only show "where to go next"
  const availableLinks = navLinks;

  return (
    <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Skilled Logo" className="h-10 w-auto object-contain" />
          <div className="flex flex-col border-l border-slate-200 pl-3">
            <span className="text-sm font-bold tracking-tight text-slate-800 uppercase">Skilled Plumbing Services</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium tracking-tighter">Old School Service</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Nav: Only showing the 'next' steps */}
        {/* Desktop Nav */}
<nav className="hidden md:flex items-center gap-6">
  {availableLinks.map((link) => {
    const isActive = pathname === link.href;

    return (
      <Link 
        key={link.href}
        href={link.href}
        className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all px-5 py-2.5 rounded-full ${
          isActive
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
        }`}
      >
        {link.name}
      </Link>
    );
  })}
</nav>
   

          {/* Burger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-end">
              <motion.span 
                animate={isOpen ? { rotate: 45, y: 9, width: "100%" } : { rotate: 0, y: 0, width: "100%" }}
                className="h-0.5 bg-current rounded-full"
              />
              <motion.span 
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="h-0.5 bg-current rounded-full w-4/5"
              />
              <motion.span 
                animate={isOpen ? { rotate: -45, y: -9, width: "100%" } : { rotate: 0, y: 0, width: "60%" }}
                className="h-0.5 bg-current rounded-full"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile/Overlay Menu */}
   {/* Mobile/Overlay Menu */}
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-hidden"
    >
      <nav className="flex flex-col py-6">
        {availableLinks.map((link, index) => {
          const isCTA = index === 0; // The first available link is the priority

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`px-8 py-5 text-sm font-bold tracking-[0.2em] uppercase transition-all flex justify-between items-center ${
                isCTA 
                  ? 'text-slate-900 bg-slate-50 border-l-4 border-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {link.name}
              
              {/* Add a subtle arrow or indicator for the CTA link */}
              {isCTA && (
                <motion.span 
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-blue-600"
                >
                  →
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  )}
</AnimatePresence>
    </header>
  );
}