"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ScrollReveal from "./ScrollReveal";

export default function CallToActionSection() {
  const user = useCurrentUser();
  const bookingHref = user?.id ? "/enroll" : "/auth/login";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 py-20 md:py-24 text-white">
      {/* Background ambient light effects */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-[700px] rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
        
        <ScrollReveal direction="up" delay={0}>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-teal-200 backdrop-blur-md border border-white/15 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>INSTANT APPOINTMENT SCHEDULING</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to Spend Less Time Waiting?
          </h2>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-teal-100/90 leading-relaxed">
            Book your next medical scan online, get a real-time digital token, and arrive right when your turn is called.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-13 px-8 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 group active:scale-98"
            >
              <Link href={bookingHref}>
                <span>Start Booking</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-13 px-7 rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-white font-semibold backdrop-blur-sm transition-colors active:scale-98"
            >
              <Link href="/#features">
                <span>Explore Features</span>
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-teal-200/80 font-medium">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>No app installation required • 100% Mobile Browser Friendly</span>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
