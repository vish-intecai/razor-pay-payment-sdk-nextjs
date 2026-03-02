import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";

/**
 * Verify Razorpay payment API.
 * Call this with payment_id, order_id, and signature from checkout handler
 * to verify the payment server-side.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Payment verification not configured" },
      { status: 500 }
    );
  }

  let body: { razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature",
      },
      { status: 400 }
    );
  }

  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    secret
  );

  if (!isValid) {
    return NextResponse.json(
      { success: false, verified: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    verified: true,
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
  });
}
