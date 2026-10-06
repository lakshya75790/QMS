"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  CheckCircle2,
  Tv,
  CalendarCheck,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  Users2,
  FileCheck,
  Smartphone,
  Layers,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function PlatformOverviewSection() {
  const [activeTab, setActiveTab] = useState<"patients" | "clinics">("patients");

  return (
    <section
      id="for-clinics"
      className="bg-slate-50/70 dark:bg-slate-950 py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800/60 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block rounded-full bg-teal-100 dark:bg-teal-950 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 mb-3">
              PLATFORM OVERVIEW
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Designed for Patients & Diagnostic Centers
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              MediScan connects patient booking with clinic operations for an orderly, transparent appointment flow.
            </p>

            {/* Tab Selector */}
            <div className="mt-8 inline-flex rounded-2xl bg-slate-200/80 p-1.5 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60">
              <button
                onClick={() => setActiveTab("patients")}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                  activeTab === "patients"
                    ? "bg-white text-teal-700 shadow-md dark:bg-slate-900 dark:text-teal-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <User className="h-4 w-4" />
                <span>For Patients</span>
              </button>

              <button
                onClick={() => setActiveTab("clinics")}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                  activeTab === "clinics"
                    ? "bg-white text-teal-700 shadow-md dark:bg-slate-900 dark:text-teal-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>For Clinics & Centers</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Tab Content: For Patients */}
        {activeTab === "patients" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-300">
            
            <ScrollReveal direction="up" delay={50}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-4">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Online Self-Booking
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Book medical scans and appointments directly from your mobile device with instant token generation.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={110}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 mb-4">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Digital Token & Turn Tracker
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Track your live token position and estimated time on your phone so you only arrive when needed.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={170}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Appointment History
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Access a central timeline of all your past diagnostic visits, dates, token logs, and doctor revisit times.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={230}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Prescription Attachments
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Download attached doctor prescriptions and scan images linked directly to your authenticated profile.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={290}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transparent Queue Info
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Clear visibility on who is currently being served and how many patients are ahead in line.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={350}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Zero Password Hassle
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Log in quickly using SMS verification codes without creating or remembering complex passwords.
                </p>
              </div>
            </ScrollReveal>

          </div>
        )}

        {/* Tab Content: For Clinics & Centers */}
        {activeTab === "clinics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-300">
            
            <ScrollReveal direction="up" delay={50}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-4">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Queue & Token Calling
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Call tokens, update check-in statuses, mark completions, and keep patient traffic moving seamlessly.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={110}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 mb-4">
                  <Tv className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Waiting Room TV Screen
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Broadcast calling tokens directly to lobby TV monitors with real-time automatic refresh and full-screen view.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={170}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Appointment Reason Management
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Configure clinic-specific visit types, scan reasons, consultation modalities, and default pricing.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={230}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                  <Users2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Staff & Receptionist Roles
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Role-based authorization for clinic administrators and front-desk reception staff with controlled access.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={290}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Multi-Branch & Clinic Portal
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Dedicated clinic portal URLs for customized center branding, patient check-in links, and operational metrics.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={350}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Subscription & Access Control
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Integrated subscription lifecycle management ensuring uninterrupted clinic operations and secure tenant isolation.
                </p>
              </div>
            </ScrollReveal>

          </div>
        )}

      </div>
    </section>
  );
}
