// lib/senders.ts
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, message: string): Promise<{ ok: boolean; error?: string }> {
  try {
    // Ensure +91 prefix for India numbers
    const formatted = to.startsWith("+") ? to : `+91${to}`;
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formatted,
      body: message,
    });

    console.log(`✅ SMS sent to ${formatted}`);
    return { ok: true };
  } catch (error: any) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    return { ok: false, error: error.message || "Failed to send SMS" };
  }
}
