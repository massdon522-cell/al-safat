import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, LineChart, BookOpen, LogIn, UserPlus, Globe } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home", icon: Home },
  { label: "About Us", href: "#about", icon: LineChart },
  { label: "News", href: "#news", icon: BookOpen },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.querySelector(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between h-20 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex flex-col leading-tight">
            <span className="text-amber-500 font-black text-2xl tracking-tighter uppercase italic">
              Al Safat
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-8 text-sm font-semibold text-white/90">
            {navLinks.map((l) => (
              <li key={l.href}>
                <button 
                  onClick={() => scrollTo(l.href)} 
                  className="flex items-center gap-2 hover:text-amber-500 transition-colors py-2 group"
                >
                  <l.icon className="h-4 w-4 text-white/70 group-hover:text-amber-500 transition-colors" />
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Button 
            variant="outline" 
            className="border-amber-500 text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-black transition-all font-bold px-6 h-10 border-2" 
            asChild
          >
            <Link to="/login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Login
            </Link>
          </Button>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 h-10" 
            asChild
          >
            <Link to="/signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Get Started
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-8 w-8 text-amber-500" /> : <Menu className="h-8 w-8 text-amber-500" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-zinc-900 border-b border-white/10 px-4 pb-8 pt-4 space-y-6 animate-in slide-in-from-top duration-300">
          <ul className="space-y-4">
            {navLinks.map((l) => (
              <li key={l.href}>
                <button 
                  onClick={() => scrollTo(l.href)} 
                  className="flex items-center gap-4 w-full text-left py-3 text-lg font-medium text-white/80 hover:text-amber-500 border-b border-white/5"
                >
                  <l.icon className="h-5 w-5 text-amber-500" />
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4">
            <Button variant="outline" className="w-full border-amber-500 text-amber-500 h-12 text-lg font-bold" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black h-12 text-lg font-bold" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
