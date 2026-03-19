import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import HowWeOperate from "@/components/HowWeOperate";
import WhyInvest from "@/components/WhyInvest";
import InvestmentPlans from "@/components/InvestmentPlans";
import ReferralSection from "@/components/ReferralSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <ServicesSection />
    <HowWeOperate />
    <WhyInvest />
    <InvestmentPlans />
    <ReferralSection />

    <Footer />
  </div>
);

export default Index;
