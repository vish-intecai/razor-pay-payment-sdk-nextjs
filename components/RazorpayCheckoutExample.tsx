"use client";

import {
  openRazorpayCheckout,
  type PaymentInitResponse,
} from "@/lib/razorpay-config";

/**
 * Example: Open Razorpay checkout when your API returns payment init response.
 *
 * Your API returns:
 * {
 *   "success": true,
 *   "payment_id": "efde41cb-...",
 *   "payment_order_id": "order_SLYjStpEa2IOn3",
 *   "payment_url": "https://checkout.razorpay.com/v1/checkout.js?order_id=...",
 * }
 *
 * Flow: openRazorpayCheckout(response) -> gateway opens -> after payment, callback verifies -> redirect to success/failure
 */
export function RazorpayCheckoutExample() {
  const handlePayment = async () => {
    // 1. Call your API to initiate payment
    const res = await fetch("YOUR_API_URL/payment/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50000, currency: "INR" }),
    });
    const data: PaymentInitResponse = await res.json();

    if (!data.success) {
      alert(data.message ?? "Failed to initiate payment");
      return;
    }

    // 2. Open Razorpay gateway with the response
    try {
      await openRazorpayCheckout(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to open payment");
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
    >
      Pay with Razorpay
    </button>
  );
}

/**
 * Open checkout directly when you already have the API response (e.g. from a previous step).
 * Usage: openRazorpayCheckout(apiResponse);
 */
export { openRazorpayCheckout };
