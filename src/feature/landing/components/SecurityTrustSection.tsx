import React from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck,
  Download,
  CheckCircle2,
  Server,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const securityFeatures = [
  {
    icon: KeyRound,
    title: "Passwordless OTP Login",
    description:
      "Access accounts securely using one-time verification codes sent to the registered phone number, eliminating stolen credential risks.",
  },
  {
    icon: Lock,
    title: "Encrypted Data Transmission",
    description:
      "Appointments, tokens, and patient records are transmitted securely across the platform using standard HTTPS/TLS protection.",
  },
  {
    icon: FileCheck,
    title: "Private Appointment Records",
    description:
      "Personal visit logs, tokens, and prescription attachments remain strictly accessible through authorized, verified accounts.",
  },
  {
    icon: Download,
    title: "Downloadable Visit Receipts",
    description:
      "Easily view and download past appointment details, token receipts, and attached medical prescriptions whenever needed.",
  },
];

export default function SecurityTrustSection() {
  return (
    <section
      id="security"
      className="bg-slate-50/70 dark:bg-slate-950 py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800/60 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block rounded-full bg-teal-100 dark:bg-teal-950 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-3">
              SECURITY & PRIVACY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your Healthcare Data Deserves Privacy.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              MediScan is designed with secure access and protected patient information at every step.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 4 Security Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {securityFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={idx} direction="up" delay={idx * 80}>
                  <div className="rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Right: Visual Security Panel */}
          <div className="lg:col-span-5 flex justify-center">
            <ScrollReveal direction="left" delay={150} className="w-full max-w-md">
              <div className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                
                {/* Background ambient glow */}
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-teal-500/20 blur-2xl" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">MediScan Security</h3>
                    <p className="text-xs text-teal-300">Protected Architecture</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  All interactions on MediScan follow strict access controls to safeguard patient identities, scan requests, and clinic operational privacy.
                </p>

                <div className="space-y-3.5 pt-4 border-t border-slate-800 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Secure Passwordless OTP Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Protected Patient & Scan Records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Encrypted HTTPS/TLS Transmission</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    <span>Isolated Clinic & Tenant Context</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400 pt-4 border-t border-slate-800/80">
                  <Server className="h-3.5 w-3.5 text-teal-400" />
                  <span>Reliable cloud infrastructure with real-time sync</span>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
