"use client";

import { useState } from "react";
import { useRazorpay } from "react-razorpay";

function extractOrderId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("order_")) return trimmed;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.searchParams.get("order_id");
  } catch {
    return null;
  }
}

export default function Home() {
  const [input, setInput] = useState("");
  const { Razorpay, isLoading, error } = useRazorpay();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = extractOrderId(input);
    if (!orderId) {
      alert("Enter a valid order ID or payment URL");
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      alert("Add NEXT_PUBLIC_RAZORPAY_KEY_ID to your env");
      return;
    }

    if (!Razorpay) {
      alert("Razorpay is still loading...");
      return;
    }

    const verifyUrl = `${window.location.origin}/payment/verify`;
    const options = {
      key: keyId,
      amount: 0, // From order when order_id is used
      currency: "INR" as const,
      order_id: orderId,
      name: "Payment",
      theme: { color: "#3399cc" },
      handler: (response: { razorpay_order_id: string }) => {
        window.location.href = `${verifyUrl}?orderId=${encodeURIComponent(response.razorpay_order_id)}`;
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <main className="w-full max-w-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Payment
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste order ID or payment URL, then press Enter"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
            autoComplete="off"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Loading Razorpay..." : "Pay"}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Paste order_id or payment URL from your API
        </p>
      </main>
    </div>
  );
}
