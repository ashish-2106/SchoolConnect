// lib/sms.ts
import twilio from "twilio";

/**
 * sendSms(to, body)
 * - Uses Twilio REST API if env vars are present
 * - Otherwise falls back to mock (dev-safe)
 */

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// ✅ Correct typing
let twilioClient: ReturnType<typeof twilio> | null = null;

if (TWILIO_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
}

export async function sendSms(to: string, body: string) {
  if (twilioClient && TWILIO_PHONE_NUMBER) {
    try {
      const formatted = to.startsWith("+") ? to : `+91${to}`;

      const res = await twilioClient.messages.create({
        body,
        from: TWILIO_PHONE_NUMBER,
        to: formatted,
      });

      return { ok: true, provider: "twilio", sid: res.sid };
    } catch (err: any) {
      console.error("Twilio SMS error:", err.message);
      return { ok: false, error: err.message };
    }
  }

  // Fallback / dev-mode
  console.warn(`[MOCK SMS] to=${to} message=${body}`);
  return { ok: true, provider: "mock" };
}
