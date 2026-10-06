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
import useLogin from "@/feature/auth/hooks/useLogin";
import { LoginVerificationStage } from "@/types/enum";
import React from "react";
import {
  Activity,
  Pencil,
  ShieldCheck,
  Lock,
  Phone,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function LoginForm() {
  const { form, isLoading, onSubmit, data } = useLogin();

  const isOtpSent =
    (form.getValues("stage") || data?.stage) ===
    LoginVerificationStage.OTPVerify;

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-12">
      
      {/* Left Column: Brand & Security Visual */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
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
            <span>Secure Patient & Clinic Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome back to MediScan
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Access your appointments, live tokens, and medical visit information securely from any device.
          </p>

          {/* Mini Queue Preview Card */}
          <div className="mt-8 rounded-2xl bg-white/10 p-4 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-teal-200 mb-2">
              <span className="font-semibold">Live Queue Sync</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="text-xs text-slate-300">
              Instant token calling • SMS alerts • Digital history
            </div>
          </div>
        </div>

        {/* Bottom security assurance */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5 text-teal-400" />
          <span>Passwordless SMS authentication</span>
        </div>
      </div>

      {/* Right Column: Modern Login Form Card */}
      <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-center">
        
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sign In
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isOtpSent
              ? "Enter the 6-digit OTP code sent to your phone"
              : "Enter your registered mobile number to continue"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Mobile Number
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FormControl>
                        <Input
                          disabled={isLoading || isOtpSent}
                          placeholder="+91 98765 43210"
                          className="h-12 rounded-xl border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 text-sm font-medium"
                          {...field}
                        />
                      </FormControl>
                    </div>

                    {isOtpSent && (
                      <Button
                        type="button"
                        asChild
                        onClick={() => {
                          form.reset();
                          setTimeout(() => {
                            window.location.reload();
                          }, 100);
                        }}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        title="Edit phone number"
                      >
                        <Link replace href="/auth/login">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  
                  <FormDescription className="text-xs text-slate-500">
                    Enter phone number with country code (e.g. +91)
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OTP Input Field */}
            {isOtpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in-50 duration-200">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Verification OTP
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="••••••"
                        maxLength={6}
                        className="h-12 rounded-xl border-teal-400 dark:border-teal-600 text-center text-xl font-bold tracking-widest focus:border-teal-500 focus:ring-teal-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-500">
                      Enter the 6-digit code received via SMS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <Button
              disabled={isLoading}
              spinner
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold shadow-md shadow-teal-600/20 hover:shadow-lg transition-all duration-200 mt-2"
            >
              {isOtpSent ? (
                <span>Verify & Sign In</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

          </form>
        </Form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
