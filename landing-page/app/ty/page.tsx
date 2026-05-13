"use client";

import { LocaleProvider } from "@/lib/i18n/context";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/ui/HeroSection";
import ServicesSection from "@/components/ui/ServicesSection";
import StatsSection from "@/components/ui/StatsSection";
import ProcessSection from "@/components/ui/ProcessSection";
import InfraSection from "@/components/ui/InfraSection";
import SolutionsSection from "@/components/ui/SolutionsSection";
import CompareSection from "@/components/ui/CompareSection";
import FAQSection from "@/components/ui/FAQSection";
import CTASection from "@/components/ui/CTASection";
import Footer from "@/components/ui/Footer";

export default function TahitianHome() {
  return (
    <LocaleProvider locale="ty">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <ProcessSection />
        <SolutionsSection />
        <InfraSection />
        <CompareSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </LocaleProvider>
  );
}
