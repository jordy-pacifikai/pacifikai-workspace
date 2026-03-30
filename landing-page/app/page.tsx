"use client";

import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/ui/HeroSection";
import ServicesSection from "@/components/ui/ServicesSection";
import StatsSection from "@/components/ui/StatsSection";
import ProcessSection from "@/components/ui/ProcessSection";
import InfraSection from "@/components/ui/InfraSection";
import SolutionsSection from "@/components/ui/SolutionsSection";
import CompareSection from "@/components/ui/CompareSection";
// import ROISection from "@/components/ui/ROISection";
import FAQSection from "@/components/ui/FAQSection";
import CTASection from "@/components/ui/CTASection";
import Footer from "@/components/ui/Footer";
import LeadMagnetPopup from "@/components/ui/LeadMagnetPopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <ProcessSection />
        <SolutionsSection />
        <InfraSection />
        <CompareSection />
        {/* <ROISection /> */}
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <LeadMagnetPopup />
    </>
  );
}
