import React from "react";
import HeroSection from "@/feature/landing/components/HeroSection";
import TrustStatsStrip from "@/feature/landing/components/TrustStatsStrip";
import HowItWorksSection from "@/feature/landing/components/HowItWorksSection";
import CoreFeaturesSection from "@/feature/landing/components/CoreFeaturesSection";
import PlatformOverviewSection from "@/feature/landing/components/PlatformOverviewSection";
import PatientJourneySection from "@/feature/landing/components/PatientJourneySection";
import SecurityTrustSection from "@/feature/landing/components/SecurityTrustSection";
import CallToActionSection from "@/feature/landing/components/CallToActionSection";
import FooterSection from "@/feature/landing/components/FooterSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <main className="flex-1">
        <HeroSection />
        <TrustStatsStrip />
        <HowItWorksSection />
        <CoreFeaturesSection />
        <PlatformOverviewSection />
        <PatientJourneySection />
        <SecurityTrustSection />
        <CallToActionSection />
      </main>
      <FooterSection />
    </div>
  );
}
