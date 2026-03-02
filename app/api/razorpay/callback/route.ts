import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";

/** Base URL for redirects - use env or derive from request */
function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

/**
 * Razorpay callback URL - receives POST from Razorpay after payment.
 * Verifies the payment, then redirects to success or failure URL.
 * Pass callback_url with redirect: true in Razorpay checkout options.
 */
export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const successUrl = `${baseUrl}/payment/success/`;
  const failureUrl = `${baseUrl}/payment/failure/`;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("RAZORPAY_KEY_SECRET is not configured");
    return NextResponse.redirect(
      `${failureUrl}?error=config&description=Payment+verification+not+configured`
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let body: Record<string, string | undefined>;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    body = Object.fromEntries(
      [...formData.entries()].map(([k, v]) => [k, String(v)])
    ) as Record<string, string>;
  } else {
    body = (await request.json()) as Record<string, string>;
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error } =
    body;

  // Payment failed - redirect to failure
  if (error || !razorpay_payment_id || !razorpay_order_id) {
    const errorDesc = body.description || body.code || "Payment failed";
    const errorCode = body.code || "payment_failed";
    return NextResponse.redirect(
      `${failureUrl}?error=${encodeURIComponent(errorCode)}&description=${encodeURIComponent(errorDesc)}`
    );
  }

  // Verify signature for successful payment
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature || "",
    secret
  );

  if (!isValid) {
    return NextResponse.redirect(
      `${failureUrl}?error=invalid_signature&description=Payment+verification+failed`
    );
  }

  // Verified - redirect to success with payment details
  const params = new URLSearchParams({
    razorpay_payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
  });
  // Forward custom params from callback URL (e.g. your backend's payment_id)
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });
  return NextResponse.redirect(`${successUrl}?${params.toString()}`);
}
