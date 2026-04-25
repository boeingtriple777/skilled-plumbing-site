import { SiInstagram } from "@icons-pack/react-simple-icons";
import { ArrowRight, ExternalLink } from "lucide-react";

const links = [
  { 
    label: "Instagram", 
    sub: "Follow for daily updates",
    href: "https://www.instagram.com/skilledplumbingservices", 
    primary: true, 
    // Using the official Instagram icon
    icon: <SiInstagram className="w-4 h-4" /> 
  },
  { 
    label: "View Portfolio", 
    sub: "Explore our recent projects",
    href: "/gallery", 
    icon: <ArrowRight className="w-4 h-4" /> 
  },
  { 
    label: "Request a Quote", 
    sub: "Contact us now ",
    href: "/quote", 
  },
];

export default function LinkTree() {
  return (
 <div className="min-h-screen bg-[#FAFAFA] pt-28 md:pt-32 pb-20 px-6">
      
      
      {/* Subtle Background Accent to match the main site */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.3)_0%,_transparent_70%)] pointer-events-none" />

<div className="z-10 w-full max-w-md mx-auto flex flex-col items-center">        {/* Logo - Slightly smaller for elegance */}
        <img src="/logo.png" className="h-28 w-auto mb-6 drop-shadow-sm" alt="Skilled Plumbing" />
        
       <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-10 w-fit mx-auto text-center">
  OLD SCHOOL SERVICE & CRAFTSMANSHIP
</div>

        <div className="w-full flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`group w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-300 active:scale-[0.98] ${
                link.primary 
                ? "bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-slate-800" 
                : "bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-sm hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-bold tracking-tight">{link.label}</span>
                <span className={`text-[11px] mt-0.5 ${link.primary ? "text-slate-400" : "text-slate-400"}`}>
                  {link.sub}
                </span>
              </div>
              
              <div className={`transition-transform duration-300 group-hover:translate-x-1 ${link.primary ? "text-white" : "text-slate-300"}`}>
                {link.icon || <ExternalLink className="w-4 h-4" />}
              </div>
            </a>
          ))}
        </div>

        {/* Footer with License - The "Professional" Anchor */}
        <div className="mt-16 flex flex-col items-center gap-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
            Skilled Plumbing Services
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            <span className="text-slate-900">PL11063 | GF20308</span>
          </p>
        </div>
      </div>
    </div>
  );
}