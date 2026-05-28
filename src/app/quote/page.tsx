"use client";

import { useState, useRef, useEffect } from "react";
import { analyseQuote, submitQuote } from "../actions/submit-quote.js";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';

export default function QuotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [aiStatusIndex, setAiStatusIndex] = useState(0);

  const AI_STATUS_MESSAGES = [
    "Uploading your photos...",
    "Analysing your photos...",
  ];

  // Turnstile State
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [previews, setPreviews] = useState<string[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]);

  // Step 2 state
  type PendingData = {
    questions: string[];
    photoUrls: string[];
    aiResult: Record<string, unknown> | null;
    formFields: { name: string; phone: string; email: string; address: string; description: string };
  };
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSubmitting || step !== 1) {
      setAiStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setAiStatusIndex(prev => Math.min(prev + 1, AI_STATUS_MESSAGES.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [isSubmitting, step]);


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
        newlySelected.map(async file => {
          const result = await imageCompression(file, options);
          return new File([result], file.name, { type: file.type });
        })
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
      allFiles.forEach(file => formData.append("photo", file));

      const result = await analyseQuote(formData);

      if (!result.success) {
        alert(result.error || "Submission failed. Please try again.");
        return;
      }

      // No questions — send email immediately and go to success
      if (!result.questions || result.questions.length === 0) {
        await submitQuote({
          formFields: result.formFields,
          photoUrls: result.photoUrls,
          aiResult: result.aiResult,
          answers: [],
        });
        setStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Questions exist — show follow-up screen
      setPendingData(result as PendingData);
      setAnswers(new Array(result.questions.length).fill(""));
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalSubmit(skip = false) {
    if (!pendingData) return;
    setIsSubmitting(true);

    try {
      const answerObjects = skip
        ? []
        : pendingData.questions.map((q, i) => ({ question: q, answer: answers[i] || "" }));

      await submitQuote({
        formFields: pendingData.formFields,
        photoUrls: pendingData.photoUrls,
        aiResult: pendingData.aiResult,
        answers: answerObjects,
      });

      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  // Step 3 — Success
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-10 md:p-12 rounded-3xl shadow-xl max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Request Received!</h2>
          <p className="text-slate-500 font-light mb-8">
            Thanks! We've received your details and we'll be in touch shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/gallery"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] block"
            >
              View our work
            </Link>
            <button
              onClick={() => { setStep(1); setPreviews([]); setAllFiles([]); setPendingData(null); setAnswers([]); }}
              className="text-slate-400 text-sm font-medium py-2 hover:text-slate-600 transition-colors"
            >
              Submit another request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 2 — Follow-up questions
  if (step === 2 && pendingData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-28 md:pt-32 pb-20 px-6">
        <div className="max-w-xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Help us nail your quote</h1>
            <p className="text-slate-500 font-light max-w-sm mx-auto">
              A couple of quick questions so we can prepare the most accurate quote before we call.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 mb-5 shadow-sm"
          >
            {pendingData.questions.map((question, i) => (
              <div key={i}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {question}
                </label>
                <input
                  type="text"
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                  disabled={isSubmitting}
                  placeholder="Your answer..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50"
                />
              </div>
            ))}
          </motion.div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleFinalSubmit(false)}
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending your quote...
                </>
              ) : "Request quote"}
            </button>
            <button
              onClick={() => handleFinalSubmit(true)}
              disabled={isSubmitting}
              className="text-slate-400 text-sm font-medium py-2 hover:text-slate-600 transition-colors"
            >
              Skip and send anyway
            </button>
          </div>
        </div>
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
  <label className="block text-[10px] uppercase tracking-widest font-bold text-black mb-2">
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
<label className="block text-[10px] uppercase tracking-widest font-bold text-black-400 mb-2">
    Phone Number <span className="text-red-500 ml-0.5">*</span>
  </label>              <input name="phone"     maxLength={10}
 type="tel" className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50" />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate mb-2">Email</label>
              <input name="email" type="email"  maxLength={30} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50"  />
            </div>

            

            <div>
             <label className="block text-[10px] uppercase tracking-widest font-bold text-black mb-2">
    Suburb <span className="text-red-500 ml-0.5">*</span>
  </label>
              <input ref={autoCompleteRef} name="address" type="text" maxLength={20} disabled={isSubmitting} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50"  />
            </div>

 {/* UPGRADED Photo Section */}
            <div className="space-y-4">
             <label className="block text-[10px] uppercase tracking-widest font-bold text-black mb-2">
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
<label className="block text-[10px] uppercase tracking-widest font-bold text-black mb-2">
    Message <span className="text-red-500 ml-0.5">*</span>
  </label>              <textarea name="description" rows={4} maxLength={1500} required disabled={isSubmitting} className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900/5 transition-all text-slate-800 disabled:opacity-50" placeholder="Tell us about the job..." />
            </div>
          </div>
                     
  {/* Turnstile Widget */}
          <div className="flex justify-center w-full py-2">
            <Turnstile
              siteKey="1x00000000000000000000AA"
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: 'light' }}
            />
          </div>
          

<button 
            type="submit" 
            disabled={isSubmitting || allFiles.length === 0 || !turnstileToken}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span>{AI_STATUS_MESSAGES[aiStatusIndex]}</span>
              </span>
            ) : "Send Request"}
          </button>
          <p className="text-xs text-center text-slate-500">
              We will only use your details to respond to your enquiry. <br></br>For more information, please read our <Link href="/privacy-policy" className="underline hover:text-slate-800 transition-colors">Privacy Policy</Link>.
            </p>
        </form>
      </div>
    </div>
  );
}