"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Activity,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function HeroSection() {
  const user = useCurrentUser();
  const bookingHref = user?.id ? "/enroll" : "/auth/login";

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-teal-50/25 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 py-16 md:py-24 lg:py-28 border-b border-slate-200/60 dark:border-slate-800/60 scroll-mt-20"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[600px] md:w-[900px] rounded-full bg-gradient-to-tr from-teal-200/40 via-cyan-200/30 to-blue-200/30 blur-3xl dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-900/10" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Hero Copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-7">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/90 px-3.5 py-1 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-800/60 dark:bg-teal-950/70 dark:text-teal-300 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              <span>SMARTER HEALTHCARE ACCESS</span>
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] break-words">
              Skip the Queue. <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Book Your Scan Smarter.
              </span>
            </h1>

            {/* Supporting paragraph */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Book medical scans, receive your digital token, and track your appointment — all from your phone. MediScan helps patients spend less time waiting and more time getting care.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-200 group active:scale-98"
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
                className="w-full sm:w-auto h-12 px-6 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium transition-colors active:scale-98"
              >
                <Link
                  href="/#how-it-works"
                  onClick={(e) => {
                    if (typeof window !== "undefined") {
                      const el = document.getElementById("how-it-works");
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: "smooth" });
                        window.history.pushState(null, "", "#how-it-works");
                      }
                    }
                  }}
                >
                  <span>See How It Works</span>
                </Link>
              </Button>
            </div>

            {/* Trust Indicator Strip */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Secure Access</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>Fast & Instant</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Mobile Friendly</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Product Card */}
          <div className="relative lg:col-span-5 flex justify-center">
            
            {/* Main Phone-style / Dashboard Card */}
            <div className="relative w-full max-w-md rounded-2xl md:rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl shadow-teal-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      City Diagnostic Center
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>Main Branch • Counter 2</span>
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Digital Token Feature Block */}
              <div className="my-5 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 p-5 text-white shadow-lg shadow-teal-600/25">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-teal-100">
                    Active Appointment Token
                  </span>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                    MRI Brain
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-teal-100">Your Number</span>
                    <div className="text-4xl font-extrabold tracking-tight">#A24</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-teal-100">Estimated Turn</span>
                    <div className="text-lg font-bold">10:40 AM</div>
                  </div>
                </div>
              </div>

              {/* Queue Status Progress */}
              <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Queue Status
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    2 patients ahead
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Serving #A22</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    You&apos;re almost there (~8 mins)
                  </span>
                </div>
              </div>

              {/* Patient details line */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Patient: <strong>Rahul Verma</strong></span>
                <span>Date: <strong>Today</strong></span>
              </div>
            </div>

            {/* Floating ambient badge 1: Appointment Confirmed */}
            <div className="absolute -top-4 -left-4 sm:-left-8 animate-float-slow rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Instant Booking</div>
                <div>Confirmed & Synced</div>
              </div>
            </div>

            {/* Floating ambient badge 2: SMS Reminder Active */}
            <div className="absolute -bottom-5 -right-2 sm:-right-6 animate-float-delayed rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
                <BellRing className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Live Notification</div>
                <div>SMS & Token Ready</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
