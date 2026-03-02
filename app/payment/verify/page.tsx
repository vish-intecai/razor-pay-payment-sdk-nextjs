"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type VerifyState =
  | { status: "loading" }
  | { status: "success"; data: Record<string, unknown> }
  | { status: "failed"; error: string; description?: string };

function VerifyContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>({ status: "loading" });

  const orderId = searchParams.get("orderId");
  const error = searchParams.get("error");
  const description = searchParams.get("description");

  useEffect(() => {
    if (error) {
      setState({
        status: "failed",
        error: error,
        description: description || undefined,
      });
      return;
    }

    if (!orderId) {
      setState({
        status: "failed",
        error: "invalid",
        description: "Missing order ID",
      });
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5002";
    const apiToken = process.env.NEXT_PUBLIC_PAYMENT_API_TOKEN;

    const verify = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

        const res = await fetch(`${apiUrl}/api/payment/verify`, {
          method: "POST",
          headers,
          body: JSON.stringify({ provider_order_id: orderId }),
        });

        const data = await res.json();

        if (res.ok && data?.success) {
          setState({ status: "success", data: data.data || data });
        } else {
          setState({
            status: "failed",
            error: data?.message || `Verify failed (${res.status})`,
            description: data?.message,
          });
        }
      } catch (err) {
        setState({
          status: "failed",
          error: "Request failed",
          description: err instanceof Error ? err.message : String(err),
        });
      }
    };

    verify();
  }, [orderId, error, description]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Verifying payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Payment Verification Failed
          </h1>
          <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
            {state.description || state.error || "Could not verify payment."}
          </p>
          {orderId && (
            <p className="text-center text-sm text-zinc-500">
              Order ID: {orderId}
            </p>
          )}
        </div>
      </div>
    );
  }

  const payment = state.data?.payment as Record<string, unknown> | undefined;
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
          Payment Verified
        </h1>
        <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
          Your payment has been verified successfully.
        </p>
        {payment && (
          <div className="space-y-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            {payment.paymentId != null && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Payment ID:</span>{" "}
                {String(payment.paymentId)}
              </p>
            )}
            {payment.paymentOrderId != null && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Order ID:</span>{" "}
                {String(payment.paymentOrderId)}
              </p>
            )}
            {payment.referenceId != null && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Reference ID:</span>{" "}
                {String(payment.referenceId)}
              </p>
            )}
            {payment.amount != null && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Amount:</span>{" "}
                {payment.currency != null ? String(payment.currency) : ""}{" "}
                {String(payment.amount)}
              </p>
            )}
            {payment.status != null && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Status:</span>{" "}
                {String(payment.status)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
