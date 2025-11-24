import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendSMS } from "@/lib/senders";
import { sendWhatsAppMessage } from "@/lib/whatsapp"; // ✅ new import

export async function POST(req: Request) {
  try {
    const { targets, message, type = "SMS", imageUrl } = await req.json();

    if (!targets || !message) {
      return NextResponse.json(
        { error: "targets and message are required" },
        { status: 400 }
      );
    }

    let recipients: { id: string; name?: string; contact: string }[] = [];

    // ✅ Send to all students
    if (targets.includes("all")) {
      const students = await prisma.student.findMany();
      recipients = students.map((s) => ({
        id: s.id,
        name: s.name,
        contact: s.parentContact,
      }));
    } else {
      // ✅ Handle specific targets (student or class)
      for (const t of targets) {
        const student = await prisma.student.findUnique({ where: { id: t } });
        if (student) {
          recipients.push({
            id: student.id,
            name: student.name,
            contact: student.parentContact,
          });
          continue;
        }

        const klass = await prisma.class.findUnique({
          where: { id: t },
          include: { students: true },
        });
        if (klass) {
          for (const s of klass.students) {
            recipients.push({
              id: s.id,
              name: s.name,
              contact: s.parentContact,
            });
          }
        }
      }
    }

    // ✅ Deduplicate recipients by contact number
    const deduped = Array.from(
      new Map(recipients.map((r) => [r.contact, r])).values()
    );

    const results: {
      to: string;
      ok: boolean;
      error?: string | null;
    }[] = [];

    // ✅ Send message (SMS or WhatsApp)
    for (const r of deduped) {
      try {
        let res;
        if (type === "WHATSAPP") {
          // send WhatsApp message (text + optional image)
          await sendWhatsAppMessage(r.contact, message, imageUrl);
          res = { ok: true };
        } else {
          // fallback to SMS
          res = await sendSMS(r.contact, message);
        }

        results.push({ to: r.contact, ok: true });
      } catch (err: any) {
        results.push({ to: r.contact, ok: false, error: err.message });
      }
    }

    // ✅ Log the message in DB
    await prisma.message.create({
      data: {
        senderId: "system",
        message,
        type,
        targets,
      },
    });

    return NextResponse.json({
      ok: true,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (err: any) {
    console.error("❌ Error in /messages/send route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
