import React from "react";
import {
  Coins,
  CalendarPlus,
  Tv,
  Smartphone,
  FileText,
  KeyRound,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function CoreFeaturesSection() {
  return (
    <section
      id="features"
      className="bg-white dark:bg-slate-900 py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800/60 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block rounded-full bg-cyan-100 dark:bg-cyan-950 px-3.5 py-1 text-xs font-semibold text-cyan-800 dark:text-cyan-300 mb-3">
              PLATFORM CAPABILITIES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Everything You Need for Smarter Scan Scheduling
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              MediScan brings appointment booking, digital tokens, live queue tracking, and clinic coordination into one connected platform.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Featured Large Card: Live Digital Token Generation */}
          <div className="lg:col-span-2">
            <ScrollReveal direction="up" delay={50} className="h-full">
              <div className="group relative h-full rounded-3xl border border-teal-200/90 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/60 dark:border-teal-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40 p-8 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
                      <Coins className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-teal-100 dark:bg-teal-900/70 px-3 py-1 text-xs font-bold text-teal-800 dark:text-teal-200">
                      Queue Tracking
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                    Live Digital Token Generation
                  </h3>
                  <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl text-sm sm:text-base leading-relaxed">
                    Generates a clear digital token number immediately upon booking, linked directly to the patient&apos;s mobile number. Real-time updates eliminate waiting room chaos and guarantee orderly consultations.
                  </p>

                  {/* Visual Preview snippet */}
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>SMS Token Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Live Queue Positioning</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Estimated Arrival Window</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-teal-100 dark:border-teal-950/60 flex items-center justify-between text-xs font-semibold text-teal-700 dark:text-teal-300">
                  <span>Automatic token sync across all devices</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 2: Direct Online Scheduling */}
          <div>
            <ScrollReveal direction="up" delay={120} className="h-full">
              <div className="group h-full rounded-3xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 p-7 shadow-sm hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                      <CalendarPlus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Appointment Booking
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    Direct Online Scheduling
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Select your visit reason or scan type, clinic center, and preferred time slot in a few simple steps with instant confirmation.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                  <span>Fast 2-minute booking flow</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 3: Clinic TV Display Board */}
          <div>
            <ScrollReveal direction="up" delay={180} className="h-full">
              <div className="group h-full rounded-3xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 p-7 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <Tv className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Lobby Display
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    Clinic TV Display Board
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Diagnostic centers can run real-time calling screens on waiting lobby TVs with automated live token announcements and zero lag.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                  <span>Full-screen broadcast mode</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 4: Universal Browser Access */}
          <div>
            <ScrollReveal direction="up" delay={240} className="h-full">
              <div className="group h-full rounded-3xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 p-7 shadow-sm hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Mobile Web
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    Universal Browser Access
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Accessible instantly on smartphone, tablet, or desktop browser without requiring any mandatory app-store downloads.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <span>Works across iOS, Android & PC</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 5: Visit History & Prescriptions */}
          <div>
            <ScrollReveal direction="up" delay={300} className="h-full">
              <div className="group h-full rounded-3xl border border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/60 p-7 shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Patient Records
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    Visit History & Prescriptions
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Securely view past appointment records, dates, token history, and attached prescription documents with one-click downloads.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Encrypted record storage</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Card 6: Passwordless OTP Verification (Featured) */}
          <div className="lg:col-span-3">
            <ScrollReveal direction="up" delay={360}>
              <div className="group rounded-3xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 p-7 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-0.5 text-xs font-semibold text-teal-300 mb-3 border border-teal-500/30">
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Secure Access</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    Passwordless OTP Verification
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                    No complex passwords to remember or lose. Log in and book securely with fast one-time verification codes sent directly to your registered phone number.
                  </p>
                </div>

                <div className="flex items-center gap-4 self-start md:self-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
                    <KeyRound className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
