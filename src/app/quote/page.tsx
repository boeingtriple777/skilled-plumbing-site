"use client";

import { useState, useRef } from "react";
import { submitQuote } from "../actions/submit-quote";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';

export default function QuotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Turnstile State
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [previews, setPreviews] = useState<string[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newlySelected = Array.from(e.target.files || []);
    
    if (allFiles.length + newlySelected.length > 5) {
      alert("Please limit your request to 5 photos total.");
      return;
    }

    setIsSubmitting(true);

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };


    try {
      const compressed = await Promise.all(
        newlySelected.map(file => imageCompression(file, options))
      );
      
      // APPEND to existing state rather than replacing
      setAllFiles(prev => [...prev, ...compressed]);
      
      const newPreviewUrls = compressed.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviewUrls]);
      
    } catch (error) {
      console.error("Compression error:", error);
    } finally {
      setIsSubmitting(false);
      // Reset input value so the same file can be picked again if deleted
      if (e.target) e.target.value = ""; 
    }
  };

  const removePhoto = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setAllFiles(prev => prev.filter((_, i) => i !== index));
  };

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.delete("photo"); 
      
      allFiles.forEach(file => {
        formData.append("photo", file);
      });

      // The Turnstile token is already in formData here 
      // under the key 'cf-turnstile-response'
      
      await submitQuote(formData);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  if (isSuccess) {
    return (
<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center bg-white p-10 md:p-12 rounded-3xl shadow-xl max-w-md w-full"
  >
    {/* Success Icon */}
    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
      ✓
    </div>

    {/* Text Content */}
    <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Request Received!</h2>
    <p className="text-slate-500 font-light mb-8">
      Thanks! We've received your details and we'll be in touch shortly.
    </p>
    
    {/* Action Buttons */}
    <div className="flex flex-col gap-3">
      <Link 
        href="/gallery" 
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] block"
      >
        View our work
      </Link>

      <button 
        onClick={() => { 
          setIsSuccess(false); 
          setPreviews([]); 
          setAllFiles([]); 
        }} 
        className="text-slate-400 text-sm font-medium py-2 hover:text-slate-600 transition-colors"
      >
        Submit another request
      </button>
    </div>
  </motion.div>
</div>
    );
  }

  return (
 <div className="min-h-screen bg-[#FAFAFA] pt-28 md:pt-32 pb-20 px-6">
      <div className="max-w-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Request a Quote</h1>
          <p className="text-slate-500 font-light">
            Fill in your details and we'll be in touch shortly.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
    Name <span className="text-red-500 ml-0.5">*</span>
  </label>
  <input 
    name="name" 
    type="text" 
    required 
    disabled={isSubmitting} 
    className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50" 
    placeholder="John Smith" 
     maxLength={30}
  />
</div>
             <div>
<label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
    Phone Number <span className="text-red-500 ml-0.5">*</span>
  </label>              <input name="phone"     maxLength={10}
 type="tel" className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50" placeholder="0400 000 000" />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Email</label>
              <input name="email" type="email"  maxLength={30} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50"  />
            </div>

            

            <div>
             <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
    Suburb <span className="text-red-500 ml-0.5">*</span>
  </label>
              <input ref={autoCompleteRef} name="address" type="text" maxLength={20} disabled={isSubmitting} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50"  />
            </div>

 {/* UPGRADED Photo Section */}
            <div className="space-y-4">
             <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
    PHOTOS OF THE JOB <span className="text-red-500 ml-0.5">*</span>
  </label>

              {/* Only show upload button if under limit */}
              {allFiles.length < 5 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all hover:border-blue-400 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Add {allFiles.length > 0 ? 'another photo' : 'photos'} ({allFiles.length}/5)</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                </div>
              )}

              {/* The Gallery Staging Area */}
              <div className="grid grid-cols-3 gap-3">
                <AnimatePresence>
                  {previews.map((url, index) => (
                    <motion.div 
                      key={url}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                    >
                      <img src={url} alt="Staged" className="w-full h-full object-cover" />
                       {/* IMPROVED DELETE BUTTON */}
        <button 
          type="button"
          onClick={() => removePhoto(index)}
          className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-full shadow-md active:scale-90 transition-transform"
          aria-label="Remove photo"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div>
<label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
    Message <span className="text-red-500 ml-0.5">*</span>
  </label>              <textarea name="description" rows={4} maxLength={1500} required disabled={isSubmitting} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50" placeholder="Tell us about the job..." />
            </div>
          </div>
  {/* Turnstile Widget */}
          /*<div className="flex justify-center w-full py-2">
            <Turnstile
              siteKey="0x4AAAAAADDfTtikCpTQkFpl"
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: 'light' }}
            />
          </div>
          

          <button 
            type="submit" 
            // Disable if submitting, no files attached, or Turnstile hasn't passed
            disabled={isSubmitting || allFiles.length === 0 || !turnstileToken}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-3"
          >
            {isSubmitting ? "Processing..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}