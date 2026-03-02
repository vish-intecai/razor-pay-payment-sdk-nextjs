/**
 * Razorpay payment URL configuration and checkout opener.
 *
 * When your API returns payment init response like:
 * {
 *   "success": true,
 *   "payment_order_id": "order_SLYjStpEa2IOn3",
 *   "payment_id": "efde41cb-...",
 *   "payment_url": "https://checkout.razorpay.com/v1/checkout.js?order_id=...",
 * }
 * Use openRazorpayCheckout(response) to open the payment gateway.
 */

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  callback_url: string;
  redirect?: boolean;
}

/** API response shape when payment is initiated */
export interface PaymentInitResponse {
  success: boolean;
  message?: string;
  payment_id: string;
  payment_order_id: string;
  payment_url?: string;
  expires_at?: string;
}

/** Get full callback URL for Razorpay - must be absolute for Razorpay to POST to */
export function getRazorpayCallbackUrl(params?: Record<string, string>): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
  const url = `${base}/api/razorpay/callback`;
  if (params && Object.keys(params).length) {
    return `${url}?${new URLSearchParams(params).toString()}`;
  }
  return url;
}

/**
 * Open Razorpay payment gateway using your API's payment init response.
 * After payment, Razorpay POSTs to callback_url -> verify API runs -> redirect to success/failure.
 *
 * @param response - API response with payment_order_id (Razorpay order_id)
 * @param keyId - Razorpay key (default: NEXT_PUBLIC_RAZORPAY_KEY_ID)
 * @param extraCallbackParams - Optional query params for callback (e.g. payment_id for your backend correlation)
 * @returns Promise that resolves when checkout opens, rejects on error
 */
export function openRazorpayCheckout(
  response: PaymentInitResponse,
  keyId?: string,
  extraCallbackParams?: Record<string, string>
): Promise<void> {
  const key = keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) {
    return Promise.reject(new Error("Razorpay key not configured"));
  }
  if (!response?.payment_order_id) {
    return Promise.reject(new Error("Invalid payment response: missing payment_order_id"));
  }
  if (!window.Razorpay) {
    return Promise.reject(
      new Error("Razorpay script not loaded. Ensure checkout.js is loaded.")
    );
  }

  const callbackParams = extraCallbackParams ?? {};
  if (response.payment_id) {
    callbackParams.payment_id = response.payment_id;
  }

  const options: RazorpayCheckoutOptions = {
    key,
    order_id: response.payment_order_id,
    callback_url: getRazorpayCallbackUrl(callbackParams),
    redirect: true,
    name: "Payment",
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
  return Promise.resolve();
}

export const RAZORPAY_ROUTES = {
  success: "/payment/success/",
  failure: "/payment/failure/",
  verify: "/api/razorpay/verify",
} as const;
