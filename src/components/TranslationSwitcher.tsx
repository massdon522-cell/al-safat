

import React, { useEffect, useState } from "react";
import { Languages, X } from "lucide-react";
import { Button } from "./ui/button";

declare global {
  interface Window {
    google: any;
    __gt_initialized: boolean;
  }
}

// 🌍 EXPANDED LANGUAGE LIST
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

  // 🌍 AFRICAN LANGUAGES
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "sw", label: "Swahili" },
  { code: "am", label: "Amharic" },

  // 🌏 ASIA
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "ms", label: "Malay" },

  // 🇪🇺 EUROPE
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
  { code: "ro", label: "Romanian" },
  { code: "cs", label: "Czech" },
  { code: "el", label: "Greek" },

  // 🌐 MIDDLE EAST
  { code: "fa", label: "Persian" },
  { code: "he", label: "Hebrew" },
];

const INCLUDED_LANGUAGES = LANGUAGES.map((l) => l.code).join(",");

const TranslationSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // ✅ INIT GOOGLE TRANSLATE ONCE
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

  // ⏳ WAIT UNTIL GOOGLE LOADS
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.translate) {
        initTranslate();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // 🔥 LANGUAGE SWITCH FIX
  const changeLanguage = (lang: string) => {
    let attempts = 0;

    const trySwitch = setInterval(() => {
      const select = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;

      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        clearInterval(trySwitch);
      }

      attempts++;
      if (attempts > 15) clearInterval(trySwitch);
    }, 300);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[999999] flex flex-col items-end gap-3">

      {/* PANEL */}
      <div
        className={`transition-all duration-300 ${isOpen
          ? "scale-100 opacity-100 block"
          : "scale-95 opacity-0 pointer-events-none hidden"
          }`}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-5 w-[320px] max-h-[400px] overflow-y-auto">

          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Languages className="text-black h-4 w-4" />
              <p className="text-black">Translate</p>
            </span>
          </div>

          {/* GOOGLE ELEMENT (HIDDEN SAFELY) */}
          <div
            id="google_translate_element"
            style={{ position: "absolute", left: "-9999px" }}
          ></div>

          {/* ⚡ DYNAMIC BUTTONS */}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                size="sm"
                className="h-8 px-1"
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.label}
              </Button>
            ))}
          </div>

          {!isReady && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              Initializing translator...
            </p>
          )}
        </div>
      </div>

      {/* FLOAT BUTTON */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl transition ${isOpen ? "bg-red-500 rotate-90" : "bg-amber-500"
          } text-white`}
      >
        {isOpen ? <X /> : <Languages />}
      </Button>
    </div>
  );
};

export default React.memo(TranslationSwitcher);