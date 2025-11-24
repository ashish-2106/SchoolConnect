// lib/email.ts
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_ADDRESS = process.env.FROM_EMAIL ?? "no-reply@school.example";

/**
 * sendEmail(to, subject, htmlOrText)
 * - Uses nodemailer if SMTP env vars are present, otherwise logs as mock.
 */
let transporter: nodemailer.Transporter | null = null;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendEmail(to: string, subject: string, htmlOrText: string) {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: FROM_ADDRESS,
        to,
        subject,
        text: htmlOrText,
        html: htmlOrText,
      });
      return { ok: true, provider: "smtp", messageId: info.messageId };
    } catch (err) {
      console.error("Nodemailer error:", err);
      return { ok: false, error: (err as any).message ?? String(err) };
    }
  }

  // fallback log
  console.warn(`[MOCK EMAIL] to=${to} subject=${subject} body=${htmlOrText}`);
  return { ok: true, provider: "mock" };
}
