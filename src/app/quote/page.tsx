"use client";
import { motion } from "framer-motion";

export default function QuotePage() {
  return (
    
<div className="min-h-screen bg-[#FAFAFA] pt-20 pb-20 px-6">    
    
          {/* Sticky Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
  <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
    
    {/* Branding */}
    
    <div className="flex items-center gap-3 md:gap-4">
      <img src="/logo.png" alt="Skilled Plumbing Logo" className="h-10 md:h-12 w-auto object-contain" />
      <div className="flex flex-col border-l border-slate-200 pl-3 md:pl-4">
              <span className="text-sm font-bold tracking-tight text-slate-800">SKILLED PLUMBING SERVICES</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">OLD SCHOOL SERVICE</span>
      </div>
    </div>

  </div>
</header>

      <div className="max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Request a Quote</h1>
          <p className="text-slate-500 font-light">
            Fill in your details and we'll get back to you.
          </p>
        </motion.div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Full Name</label>
              <input type="text" className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" placeholder="John Smith" />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Phone Number</label>
              <input type="tel" className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" placeholder="0400 000 000" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Service Required</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all">
                <option>General Maintenance</option>
                <option>Renovations</option>
                <option>Hot Water System</option>
                <option>Emergency Repairs</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" placeholder="Tell us about the job..." />
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold tracking-wide shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]">
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}