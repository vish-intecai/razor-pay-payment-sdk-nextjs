import type { NextConfig } from "next";

/** Razorpay SDK payment URLs - used for redirects after payment */
const RAZORPAY_PAYMENT_URLS = {
  /** URL where users land after successful payment - verify API is triggered from callback */
  success: "/payment/success/",
  /** URL where users land after failed/cancelled payment */
  failure: "/payment/failure/",
  /** API route that receives Razorpay POST callback - verifies payment and redirects */
  callback: "/api/razorpay/callback",
  /** API route to verify payment (can be called from frontend with payment details) */
  verify: "/api/razorpay/verify",
} as const;

const nextConfig: NextConfig = {
  // Note: Removed output: "export" - API routes (callback, verify) require server
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    RAZORPAY_PAYMENT_SUCCESS_URL: RAZORPAY_PAYMENT_URLS.success,
    RAZORPAY_PAYMENT_FAILURE_URL: RAZORPAY_PAYMENT_URLS.failure,
    RAZORPAY_CALLBACK_URL: RAZORPAY_PAYMENT_URLS.callback,
    RAZORPAY_VERIFY_URL: RAZORPAY_PAYMENT_URLS.verify,
  },
  output: "export",
};

export default nextConfig;
export { RAZORPAY_PAYMENT_URLS };
