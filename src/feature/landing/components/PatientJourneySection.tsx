import React from "react";
import {
  CalendarPlus,
  Coins,
  Activity,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const journeySteps = [
  {
    step: "01",
    title: "Book",
    subtitle: "Select scan & time from your phone",
    icon: CalendarPlus,
  },
  {
    step: "02",
    title: "Get Token",
    subtitle: "Instant digital token & confirmation",
    icon: Coins,
  },
  {
    step: "03",
    title: "Track Queue",
    subtitle: "Monitor tokens ahead in real time",
    icon: Activity,
  },
  {
    step: "04",
    title: "Arrive",
    subtitle: "Reach clinic right when your turn is up",
    icon: MapPin,
  },
  {
    step: "05",
    title: "Complete Visit",
    subtitle: "Finish scan & access visit history",
    icon: CheckCircle2,
  },
];

export default function PatientJourneySection() {
  return (
    <section className="bg-white dark:bg-slate-900 py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block rounded-full bg-teal-100 dark:bg-teal-950 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-3">
              PATIENT EXPERIENCE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Less Waiting. More Clarity.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              A clear, predictable experience designed to eliminate waiting room anxiety from start to finish.
            </p>
          </div>
        </ScrollReveal>

        {/* Linear Journey Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
          {journeySteps.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === journeySteps.length - 1;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                <div className="group relative flex flex-col items-center text-center rounded-2xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Step badge */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold shadow-md shadow-teal-600/30 mb-4 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                    Step {item.step}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.subtitle}
                  </p>

                  {/* Arrow indicator between steps on desktop */}
                  {!isLast && (
                    <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 z-10">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
