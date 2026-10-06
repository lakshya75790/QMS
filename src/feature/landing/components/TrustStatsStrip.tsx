import React from "react";
import { Coins, Clock3, ShieldCheck, Globe } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const trustItems = [
  {
    icon: Coins,
    title: "Digital Token Management",
    description: "Instant token assignment upon booking, linked directly to your mobile number.",
  },
  {
    icon: Clock3,
    title: "Real-Time Queue Updates",
    description: "Live queue tracking so you can arrive right when your scan is ready.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Patient Access",
    description: "Protected one-time verification access for all appointments and history.",
  },
  {
    icon: Globe,
    title: "Browser-Based Booking",
    description: "Instant access from any smartphone, tablet, or desktop with no downloads.",
  },
];

export default function TrustStatsStrip() {
  return (
    <section className="bg-white dark:bg-slate-900/60 py-12 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Trusted & Efficient Scheduling
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Built for a Smoother Healthcare Experience
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 90}>
                <div className="group relative h-full rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 dark:hover:border-teal-700/60 hover:bg-white dark:hover:bg-slate-850 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 mb-4 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
