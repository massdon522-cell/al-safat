import { MapPin, Home, LogIn, UserPlus, FileText, Shield, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-zinc-400 py-16 border-t border-zinc-900">
      <div className="container mx-auto px-4">
        {/* Top Section: Three Columns */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Location */}
          <div>
            <h3 className="text-amber-500 text-xl font-bold mb-6">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <span>United State us</span>
            </div>
          </div>

          {/* Quicklinks */}
          <div>
            <h3 className="text-amber-500 text-xl font-bold mb-6">Quicklinks</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                <Home className="h-4 w-4" /> Home
              </li>
              <li className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                <LogIn className="h-4 w-4" /> login
              </li>
              <li className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                <UserPlus className="h-4 w-4" /> Sign up
              </li>
              <li className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                <FileText className="h-4 w-4" /> Terms
              </li>
              <li className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                <Shield className="h-4 w-4" /> PrivacyPolicy
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-amber-500 text-xl font-bold mb-6">Contacts</h3>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span>contact email</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Logo + Description */}
        <div className="border-t border-zinc-900 pt-16 flex flex-col md:flex-row gap-12 items-start justify-between">
          <div className="max-w-xs">
            <h2 className="text-amber-500 text-2xl font-bold mb-8 uppercase tracking-tighter italic">World Best Platform</h2>
            <div className="relative w-32 h-32 text-amber-500">
              {/* Styled Building Illustration using SVG for precise match to image */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current opacity-80">
                <rect x="10" y="30" width="30" height="70" className="opacity-40" />
                <rect x="40" y="50" width="20" height="50" />
                <rect x="60" y="40" width="30" height="60" className="opacity-60" />
                <line x1="15" y1="40" x2="35" y2="40" stroke="currentColor" strokeWidth="2" strokeDasharray="2,4" />
                <line x1="15" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="2,4" />
                <line x1="45" y1="60" x2="55" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="2,4" />
                <line x1="65" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="2,4" />
                <line x1="65" y1="60" x2="85" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="2,4" />
              </svg>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-zinc-400 text-base leading-relaxed mb-8">
              World Best Platform is a unique investment firm that provides investors with exclusive access to high-growth investment opportunities in various markets and a range of services. We follow industry-leading trading practices in Indices, Forex, Commodities, Shares, Options, Stock, and Crypto-Mining as part of our operations, while offering flexible investment plans. Our company thrives on the strength of our extensive network of global clients, which further enhances our capabilities.
            </p>
            <div className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} World Best Platform
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
