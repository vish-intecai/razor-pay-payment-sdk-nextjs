import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

/**
 * Create a Razorpay order for checkout.
 * Call this before opening Razorpay checkout.
 */
export async function POST(request: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay keys not configured" },
      { status: 500 }
    );
  }

  let body: { amount?: number; currency?: string; receipt?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const amount = body.amount ?? 50000; // 500 INR in paise
  const currency = body.currency ?? "INR";
  const receipt = body.receipt ?? `rcpt_${Date.now()}`;

  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await instance.orders.create({
      amount,
      currency,
      receipt,
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
