"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import useSignUp from "@/feature/auth/hooks/useSignUp";
import React from "react";
import {
  Activity,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function SignUpForm() {
  const { form, isLoading, onSubmit } = useSignUp();

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-12">
      
      {/* Left Column: Brand & Value Proposition */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-teal-500/20 blur-2xl" />

        <div>
          {/* Brand header */}
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-teal-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Medi<span className="text-teal-400">Scan</span>
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 mb-4 border border-teal-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Fast Registration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Create your MediScan account
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Register once and manage your medical scan appointments, live queue tokens, and prescription history with ease.
          </p>

          {/* Value points */}
          <div className="mt-8 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Instant digital token generation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Live turn tracking from your phone</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Full past appointment history</span>
            </div>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          Takes less than 30 seconds to join
        </div>
      </div>

      {/* Right Column: Modern Registration Form */}
      <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-center">
        
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Get Started
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your details to create your patient account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="e.g. Rahul Sharma"
                      className="h-12 rounded-xl border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 text-sm font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobile Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Mobile Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="h-12 rounded-xl border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 text-sm font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-slate-500">
                    Used for SMS appointment notifications and OTP login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              disabled={isLoading}
              spinner
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold shadow-md shadow-teal-600/20 hover:shadow-lg transition-all duration-200 mt-2"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>

          </form>
        </Form>

        {/* Footer link to sign in */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
