import React, { useEffect, useState } from "react";
import { Languages, Globe } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

declare global {
  interface Window {
    google: any;
    __gt_initialized: boolean;
  }
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "zh-CN", label: "Chinese" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "it", label: "Italian" },
  { code: "tr", label: "Turkish" },
  { code: "nl", label: "Dutch" },
  { code: "vi", label: "Vietnamese" },
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "sw", label: "Swahili" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "fa", label: "Persian" },
];

const INCLUDED_LANGUAGES = LANGUAGES.map((l) => l.code).join(",");

const TranslationSwitcher = () => {
  const [isReady, setIsReady] = useState(false);

  const initTranslate = () => {
    if (window.__gt_initialized) {
      setIsReady(true);
      return;
    }

    if (window.google?.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: INCLUDED_LANGUAGES,
          autoDisplay: false,
        },
        "google_translate_element"
      );

      window.__gt_initialized = true;
      setIsReady(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.translate) {
        initTranslate();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lang: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Retry in case it's not ready
      setTimeout(() => changeLanguage(lang), 500);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Hidden element for Google Translate to attach to */}
      <div id="google_translate_element" className="hidden" aria-hidden="true"></div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white/80 hover:text-amber-500 hover:bg-white/5 h-9 px-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white w-48 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="p-2 border-b border-white/5 mb-1 px-3">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2">
               <Languages className="h-3 w-3" /> Select Region
            </span>
          </div>
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="hover:bg-amber-500 hover:text-black cursor-pointer text-xs font-medium py-2 rounded-lg transition-colors"
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
          {!isReady && (
            <div className="p-2 text-[10px] text-zinc-500 text-center animate-pulse">
              Loading engine...
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default React.memo(TranslationSwitcher);