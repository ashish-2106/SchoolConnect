// send-test-sms.js
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendTestSMS() {
  try {
    const message = await client.messages.create({
      body: "Hello! This is a test SMS from your Twilio integration in SchoolConnect ✅",
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
      to: "+918290893008", // Your verified personal number
    });

    console.log("✅ Message sent successfully!");
    console.log("SID:", message.sid);
  } catch (error) {
    console.error("❌ Failed to send SMS:");
    console.error(error);
  }
}

sendTestSMS();
