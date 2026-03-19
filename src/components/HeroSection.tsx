import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1773332598413-a6d5279d1ae8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8",
    title: "Al Safat: An investment opportunity accross vast sectors",
    subtitle: "A scaling solutions in innovative styles",
  },
  {
    image: "https://images.unsplash.com/photo-1579389082366-6a268f7c20e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDExfHx8ZW58MHx8fHx8",
    title: "Leading the Wave of Future Technology",
    subtitle: "Comprehensive solutions for global enterprises with Al Safat",
  },
  {
    image: "https://images.unsplash.com/photo-1675098978972-d566fff45c37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8",
    title: "Strategic Partnerships for Lasting Growth",
    subtitle: "Dedicated to excellence in every endeavor at Al Safat",
  },
];

const HeroSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);


  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section id="home" className="relative h-screen min-h-[700px] w-full overflow-hidden">

      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={index} className="relative flex-[0_0_100%] min-w-0 h-full">
              {/* Background Image with Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-110"
                style={{ backgroundImage: `url('${slide.image}')` }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>

              {/* Content */}
              <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center z-10 pt-20">
                <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg uppercase italic">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-amber-500 font-medium mb-12 drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-10 py-7 rounded-md shadow-2xl transition-all hover:scale-105 uppercase"
                    onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <UserPlus className="mr-2 h-6 w-6" /> get started
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white/50 hover:bg-amber-500 hover:text-black hover:scale-110 transition-all border border-white/10 hidden md:block"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white/50 hover:bg-amber-500 hover:text-black hover:scale-110 transition-all border border-white/10 hidden md:block"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Hero Footnote / Indicator Style */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="w-12 h-1 rounded-full transition-all duration-300 bg-white/30"
            style={{
              backgroundColor: emblaApi?.selectedScrollSnap() === i ? "#f59e0b" : "rgba(255,255,255,0.3)"
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
