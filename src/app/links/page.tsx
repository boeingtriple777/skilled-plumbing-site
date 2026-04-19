const links = [
  { label: "Emergency Call-Out", href: "tel:+61...", primary: true },
  { label: "Request a Quote", href: "/#quote" },
  { label: "View Our Work", href: "/gallery" },
  { label: "Instagram", href: "https://instagram.com/..." },
  { label: "Facebook", href: "https://facebook.com/..." },
];

export default function LinkTree() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center px-6 pt-20">
      <img src="/logo.png" className="h-16 w-auto mb-4" alt="Skilled Plumbing" />
      <h1 className="text-xl font-bold text-slate-900 mb-8">@skilledplumbingservices</h1>
      
      <div className="w-full max-w-md flex flex-col gap-4">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`w-full py-4 text-center rounded-2xl font-medium transition-all active:scale-95 ${
              link.primary 
              ? "bg-slate-900 text-white shadow-xl" 
              : "bg-white border border-slate-200 text-slate-700 shadow-sm"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}