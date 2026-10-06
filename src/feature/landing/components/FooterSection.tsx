"use client";

import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  const user = useCurrentUser();
  const bookingHref = user?.id ? "/enroll" : "/auth/login";
  const appointmentsHref = user?.id ? `/token/t/${user.phone}` : "/auth/login";
  const historyHref = user?.id ? "/history" : "/auth/login";

  return (
    <footer className="border-t border-slate-200/80 bg-slate-900 text-slate-300 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Medi<span className="text-teal-400">Scan</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Smarter appointment scheduling and real-time digital queue management for patients and diagnostic centers.
            </p>

            <div className="pt-2 text-xs text-slate-500">
              Transforming diagnostic waiting experiences through accessible technology.
            </div>
          </div>

          {/* Column: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#home"
                  onClick={(e) => {
                    if (typeof window !== "undefined") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      window.history.pushState(null, "", "#home");
                    }
                  }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
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
                  className="hover:text-teal-400 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  onClick={(e) => {
                    if (typeof window !== "undefined") {
                      const el = document.getElementById("features");
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: "smooth" });
                        window.history.pushState(null, "", "#features");
                      }
                    }
                  }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#security"
                  onClick={(e) => {
                    if (typeof window !== "undefined") {
                      const el = document.getElementById("security");
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: "smooth" });
                        window.history.pushState(null, "", "#security");
                      }
                    }
                  }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Security & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Patients */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Patients
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href={bookingHref} className="hover:text-teal-400 transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href={appointmentsHref} className="hover:text-teal-400 transition-colors">
                  My Appointments
                </Link>
              </li>
              <li>
                <Link href={historyHref} className="hover:text-teal-400 transition-colors">
                  Visit History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Clinics & Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Clinics & Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auth/login" className="hover:text-teal-400 transition-colors">
                  Clinic Portal
                </Link>
              </li>
              <li>
                <Link href="/token/display" className="hover:text-teal-400 transition-colors">
                  Waiting Room Display
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-teal-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href={bookingHref} className="hover:text-teal-400 transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} MediScan. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">
              Secure Healthcare Scheduling
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
