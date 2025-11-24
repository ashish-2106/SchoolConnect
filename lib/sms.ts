// lib/sms.ts
import Twilio from "twilio";

/**
 * sendSms(to, body)
 * - If TWILIO_SID & TWILIO_AUTH_TOKEN are present, uses Twilio REST API.
 * - Otherwise logs and returns a mock success response.
 *
 * NOTE: ensure TWILIO_PHONE_NUMBER is set if you use Twilio.
 */

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: Twilio | null = null;
if (TWILIO_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
}

export async function sendSms(to: string, body: string) {
  if (twilioClient && TWILIO_PHONE_NUMBER) {
    try {
      const res = await twilioClient.messages.create({
        body,
        from: TWILIO_PHONE_NUMBER,
        to,
      });
      return { ok: true, provider: "twilio", sid: res.sid };
    } catch (err) {
      console.error("Twilio SMS error:", err);
      return { ok: false, error: (err as any).message ?? String(err) };
    }
  }

  // Fallback / dev-mode
  console.warn(`[MOCK SMS] to=${to} message=${body}`);
  return { ok: true, provider: "mock" };
}
