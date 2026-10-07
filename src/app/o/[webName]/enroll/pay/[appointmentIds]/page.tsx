import { currentUser } from "@/action/currentUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPOINTMENT_ID_HASH_NAME } from "@/constant";
import UserType from "@/feature/organization/components/sections/UserType";
import PaymentTabsSection from "@/feature/payments/appointmentPayments/components/sections/PaymentTabsSection";
import { client } from "@/lib/rpc";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { PagePropsPromise } from "@/types";
import { CreditCard, Package, Receipt, Stethoscope, User, PlusCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";

const getAppointmentPaymentInfo = async ({
  webName,
  appointmentIds,
}: {
  webName: string;
  appointmentIds: string;
}) => {
  try {
    const hash = decodeURIComponent(appointmentIds);
    const res = await client.api.main.enroll[":webName"]["payment-overview"][
      "$post"
    ]({
      param: {
        webName,
      },
      json: {
        [APPOINTMENT_ID_HASH_NAME]: hash,
      },
    });
    if (!res.ok) throw await res.json();

    const data = await res.json();
    return { ...data, hash };
  } catch (error) {
    const err = await getReadableErrorMessage(error);
    return { error: err };
  }
};

const page = async ({ params }: PagePropsPromise) => {
  const awaitedParams = await params;
  const { appointmentIds, webName } = awaitedParams;
  if (!appointmentIds) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-semibold text-rose-600">No appointment IDs provided</p>
      </div>
    );
  }

  const paymentInfo = await getAppointmentPaymentInfo({
    webName,
    appointmentIds,
  });

  if ("error" in paymentInfo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-semibold text-rose-600">{paymentInfo.error}</p>
      </div>
    );
  }

  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Please log in to proceed with the appointment payment.
        </p>
        <Button asChild className="rounded-xl bg-teal-600 text-white">
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Success Header Container */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Appointment Created Successfully
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Queue Token & Payment Confirmation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review your generated tokens and complete appointment payment.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200 text-xs font-medium">
              <Link href={`/admin/dashboard/organization/o/${webName}/token/search`}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Appointments
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700">
              <Link href={`/o/${webName}/admin/enroll`}>
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Add Another Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Prominent Generated Tokens Cards Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Generated Queue Tokens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentInfo.appointmentWithCost.map((item) => (
              <Card
                key={item.appointment.id}
                className="rounded-2xl border border-teal-200/80 dark:border-teal-800/80 bg-gradient-to-br from-teal-50/40 to-cyan-50/40 dark:from-teal-950/30 dark:to-cyan-950/30 p-5 shadow-xs relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-14 flex-col items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                      <span className="text-[9px] font-bold uppercase tracking-wider">TOKEN</span>
                      <span className="text-lg font-extrabold font-mono leading-none">
                        #{item.appointment.tokenNumber}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      ₹{item.appointment?.price?.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.appointment.patientName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 capitalize flex items-center gap-1 mt-0.5">
                      <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                      {item.appointment.reasonForVisit}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-teal-200/40 dark:border-teal-900/40">
                    Please keep token number <strong>#{item.appointment.tokenNumber}</strong> handy when called.
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment & Summary Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Appointment Details Table */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Package className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  Appointment Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Review appointment details before completing payment settlement
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 dark:bg-slate-800/50">
                      <TableHead className="text-xs font-bold">
                        <UserType />
                      </TableHead>
                      <TableHead className="text-xs font-bold">Service</TableHead>
                      <TableHead className="text-xs font-bold">Token</TableHead>
                      <TableHead className="text-xs font-bold text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentInfo?.appointmentWithCost.map((item) => (
                      <TableRow key={item.appointment.id}>
                        <TableCell className="font-semibold text-xs text-slate-900 dark:text-white">
                          {item.appointment.patientName}
                        </TableCell>
                        <TableCell className="capitalize text-xs text-slate-600 dark:text-slate-300">
                          {item.appointment.reasonForVisit}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                          #{item.appointment.tokenNumber}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                          ₹{item.appointment?.price?.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment Method Selector */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <CreditCard className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  Payment Method
                </CardTitle>
                <CardDescription className="text-xs">
                  Select your preferred settlement method
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Suspense fallback={<div className="h-32 bg-slate-100 animate-pulse rounded-xl" />}>
                  <PaymentTabsSection
                    appointmentIds={paymentInfo.hash}
                    paymentInfo={paymentInfo}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Receipt className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  Payment Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Subtotal breakdown of your appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {paymentInfo.appointmentWithCost.map((item) => (
                    <div
                      key={item.appointment.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.appointment.patientName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                          {item.appointment.reasonForVisit}
                        </p>
                      </div>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{item.appointment?.price?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <p>Subtotal</p>
                    <p className="font-mono">₹{paymentInfo.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <p>Tax / Charges</p>
                    <p className="font-mono">₹0</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">Total Due</p>
                    <p className="text-lg font-extrabold font-mono text-teal-600 dark:text-teal-400">
                      ₹{paymentInfo.totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <User className="h-4 w-4 text-teal-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  For questions regarding queue tokens or payment status, please contact the clinic reception counter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
