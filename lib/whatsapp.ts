// lib/whatsapp.ts
import twilio from "twilio";
import type { MessageListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/message";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

/**
 * Send a WhatsApp message using Twilio API
 *
 * @param to - Recipient WhatsApp number (e.g., "+919876543210" or "9876543210")
 * @param message - Text message to send
 * @param imageUrl - (Optional) URL of the image to attach
 * @returns Twilio message SID if successful
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  imageUrl?: string
): Promise<string> {
  try {
    // ✅ Ensure proper phone number format
    let normalized = to.trim();
    if (!normalized.startsWith("+")) {
      // default to India (+91)
      normalized = `+91${normalized}`;
    }

    if (!/^\+\d{8,15}$/.test(normalized)) {
      throw new Error(`Invalid phone number: ${to}`);
    }

    // ✅ Build Twilio payload (with correct type)
    const msgData: MessageListInstanceCreateOptions = {
      from: process.env.TWILIO_WHATSAPP_NUMBER!, // e.g. 'whatsapp:+14155238886'
      to: `whatsapp:${normalized}`,
      body: message,
    };

    if (imageUrl) {
      msgData.mediaUrl = [imageUrl];
    }

    // ✅ Send message
    const response = await client.messages.create(msgData);
    console.log(
      `✅ WhatsApp message sent to ${normalized}: SID=${response.sid}, Status=${response.status}`
    );

    return response.sid;
  } catch (error: any) {
    console.error(`❌ Error sending WhatsApp message to ${to}: ${error.message}`);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}
