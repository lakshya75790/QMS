"use client";

import React from "react";
import { UserCheck, CalendarDays, QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    step: "01",
    title: "Register & Enter Details",
    description:
      "Enter your mobile number and basic patient information to initiate your appointment registration without complex account setup.",
    icon: UserCheck,
    badge: "Quick Start",
  },
  {
    step: "02",
    title: "Select Scan & Time",
    description:
      "Select the scan type or reason for your visit, choose the clinic center, and pick your preferred time slot that fits your schedule.",
    icon: CalendarDays,
    badge: "Custom Choice",
  },
  {
    step: "03",
    title: "Receive Live Token",
    description:
      "Get your digital token number instantly on your device and arrive right when your turn is scheduled, skipping crowded waiting lobbies.",
    icon: QrCode,
    badge: "Zero Waiting",
  },
];

export default function HowItWorksSection() {
  const user = useCurrentUser();
  const bookingHref = user?.id ? "/enroll" : "/auth/login";

  return (
    <section
      id="how-it-works"
      className="relative bg-slate-50/70 dark:bg-slate-950 py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800/60 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block rounded-full bg-teal-100 dark:bg-teal-950 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-3">
              PROCESS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Booking your medical scan is simple, fast, and straightforward with MediScan.
            </p>
          </div>
        </ScrollReveal>

        {/* Steps Grid / Timeline */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-teal-200 via-cyan-300 to-blue-200 dark:from-teal-900 dark:via-cyan-800 dark:to-blue-900 -translate-y-12 z-0" />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 120}>
                <div className="relative z-10 flex flex-col h-full rounded-2xl md:rounded-3xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 group hover:-translate-y-1.5">
                  {/* Step Number & Icon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-teal-600/30 dark:text-teal-400/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.step}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700 dark:from-teal-950 dark:to-slate-900 dark:text-teal-300 border border-teal-100 dark:border-teal-800/80 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="inline-flex w-fit rounded-md bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-3 border border-teal-200/60 dark:border-teal-900">
                    {item.badge}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <ScrollReveal direction="up" delay={200}>
          <div className="mt-14 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium px-8 shadow-md active:scale-98 transition-all"
            >
              <Link href={bookingHref}>
                <span>Book an Appointment Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
