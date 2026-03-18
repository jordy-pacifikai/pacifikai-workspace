import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { SplitExpertise } from "@/components/home/SplitExpertise";
import { ExpertiseGrid } from "@/components/home/ExpertiseGrid";
import { Testimonials } from "@/components/Testimonials";
import { CTAFinal } from "@/components/home/CTAFinal";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <SplitExpertise />
      <ExpertiseGrid />
      <Testimonials />
      <CTAFinal />
    </>
  );
}
