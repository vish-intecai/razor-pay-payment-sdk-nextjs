"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const razorpayPaymentId = searchParams.get("razorpay_payment_id");
  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  const referenceId = searchParams.get("reference_id");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Payment Successful
        </h1>
        <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
          Your payment has been verified successfully.
        </p>
        {(razorpayPaymentId || orderId || paymentId || referenceId) && (
          <div className="space-y-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            {razorpayPaymentId && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Payment ID:</span> {razorpayPaymentId}
              </p>
            )}
            {orderId && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Order ID:</span> {orderId}
              </p>
            )}
            {referenceId && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Reference ID:</span> {referenceId}
              </p>
            )}
            {paymentId && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Payment Ref:</span> {paymentId}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
