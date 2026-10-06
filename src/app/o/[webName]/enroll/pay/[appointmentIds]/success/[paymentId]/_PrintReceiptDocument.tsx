"use client";

import React from "react";
import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { formatDate } from "@/lib/utils/dateUtils";

interface PrintReceiptDocumentProps {
  paymentData:
    | InferResponseType<
        (typeof client.api.main.payments.appointment.view.u)[":userId"]["o"][":paymentId"]["$get"],
        200
      >
    | InferResponseType<
        (typeof client.api.main.payments.appointment.view)["a"][":appointmentId"]["$get"],
        200
      >;
}

export default function PrintReceiptDocument({
  paymentData,
}: PrintReceiptDocumentProps) {
  const dataObj = paymentData?.data as
    | {
        payment?: {
          id: string;
          paymentStatus: string | null;
          createdAt: string;
          updatedAt: string;
          totalAmount: string;
          paymentMethod: string;
        };
        appointments?: Array<{
          appointment: {
            id: string;
            patientName: string;
            reasonForVisit: string;
            tokenNumber: number | string;
            appointmentStatus: string;
            phone?: string;
          };
          paymentLink?: {
            amount: string;
          };
        }>;
        user?: {
          name?: string;
          phone?: string;
        };
      }
    | undefined;

  const payment = dataObj?.payment;
  const appointments = dataObj?.appointments || [];
  const user = dataObj?.user;

  const paymentStatus = payment?.paymentStatus || "PENDING";
  const rawAmount = payment?.totalAmount
    ? Number.parseFloat(payment.totalAmount)
    : 0;
  const totalAmountFormatted = rawAmount.toLocaleString("en-IN");

  // Fallbacks for patient name/phone
  const patientName =
    user?.name || appointments[0]?.appointment?.patientName || "N/A";
  const patientPhone =
    user?.phone || (appointments[0]?.appointment as { phone?: string })?.phone || "N/A";

  return (
    <div className="print-receipt-container hidden print:block w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-8 font-sans">
      {/* Receipt Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              MEDISCAN
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-700 mt-1 uppercase tracking-wide">
            Payment Receipt
          </p>
          <p className="text-xs text-slate-500">
            Appointment & Payment Confirmation
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Date & Time
          </p>
          <p className="text-xs font-semibold text-slate-800">
            {payment?.createdAt ? formatDate(payment.createdAt) : "N/A"}
          </p>
        </div>
      </div>

      {/* Payment Status Banner */}
      <div
        className={`p-4 rounded-lg mb-6 border text-center ${
          paymentStatus === "COMPLETED"
            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
            : paymentStatus === "PENDING"
              ? "bg-amber-50/80 border-amber-300 text-amber-950"
              : "bg-rose-50/80 border-rose-300 text-rose-950"
        }`}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
          Payment Status
        </p>
        <h2 className="text-xl font-extrabold mt-0.5 tracking-tight">
          {paymentStatus === "COMPLETED"
            ? "PAYMENT SUCCESSFUL"
            : paymentStatus === "PENDING"
              ? "PAYMENT PENDING"
              : "PAYMENT FAILED"}
        </h2>
        <p className="text-2xl font-black mt-1">₹{totalAmountFormatted}</p>
        <p className="text-xs mt-1 opacity-90">
          {paymentStatus === "COMPLETED"
            ? "Payment has been processed successfully."
            : paymentStatus === "PENDING"
              ? "Payment confirmation is currently pending."
              : "Payment processing was unsuccessful."}
        </p>
      </div>

      {/* Payment Details & Confirmation Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Payment Details */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200">
            Payment Details
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment ID</span>
              <span className="font-mono font-semibold text-slate-900">
                {payment?.id || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Amount</span>
              <span className="font-bold text-slate-900">
                ₹{totalAmountFormatted}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="font-semibold text-slate-800">
                {payment?.paymentMethod || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="font-bold text-slate-900 uppercase">
                {paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Date</span>
              <span className="font-medium text-slate-800">
                {payment?.createdAt ? formatDate(payment.createdAt) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Confirmation Date</span>
              <span className="font-medium text-slate-800">
                {payment?.updatedAt ? formatDate(payment.updatedAt) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200">
            Payment Confirmation
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Name</span>
              <span className="font-bold text-slate-900">{patientName}</span>
            </div>
            {patientPhone !== "N/A" && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Phone</span>
                <span className="font-semibold text-slate-800">{patientPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total Appointments</span>
              <span className="font-semibold text-slate-800">
                {appointments.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Table */}
      <div className="mb-6">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-900">
            Appointment Details
          </h3>
          <p className="text-xs text-slate-500">
            Information about your scheduled appointments
          </p>
        </div>

        <table className="w-full border-collapse border border-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-2 text-left border-r border-slate-200">
                Patient Name
              </th>
              <th className="p-2 text-left border-r border-slate-200">Reason</th>
              <th className="p-2 text-center border-r border-slate-200">
                Token
              </th>
              <th className="p-2 text-left border-r border-slate-200">
                Status
              </th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {appointments.map((item) => (
              <tr key={item?.appointment?.id} className="text-slate-800 break-inside-avoid">
                <td className="p-2 font-semibold border-r border-slate-200">
                  {item?.appointment?.patientName}
                </td>
                <td className="p-2 border-r border-slate-200">
                  {item?.appointment?.reasonForVisit}
                </td>
                <td className="p-2 text-center font-bold border-r border-slate-200 text-slate-900">
                  {item?.appointment?.tokenNumber}
                </td>
                <td className="p-2 border-r border-slate-200 font-medium">
                  {item?.appointment?.appointmentStatus}
                </td>
                <td className="p-2 text-right font-semibold">
                  ₹
                  {Number.parseFloat(
                    item?.paymentLink?.amount || "0",
                  ).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Amount Summary */}
        <div className="flex justify-end mt-3">
          <div className="w-60 border-2 border-slate-800 rounded-md p-2.5 bg-slate-50 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wide">
              Total Amount
            </span>
            <span className="font-extrabold text-base text-slate-900">
              ₹{totalAmountFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation & Reschedule Guidelines */}
      <div className="border border-slate-200 rounded-lg p-4 mb-6 bg-slate-50/40 text-xs space-y-2.5">
        <div>
          <h4 className="font-bold text-slate-900 mb-0.5">
            Appointment Confirmation
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Your appointments have been confirmed. Please arrive 15 minutes
            before your scheduled time and bring your token number.
          </p>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <h4 className="font-bold text-slate-900 mb-0.5">
            Need to Reschedule?
          </h4>
          <p className="text-slate-600 leading-relaxed">
            If you need to reschedule your appointment, please contact our support
            team at least 24 hours in advance.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-300 pt-3 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-800">
          Thank you for using MediScan.
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          This is an official computer-generated receipt.
        </p>
      </div>
    </div>
  );
}
