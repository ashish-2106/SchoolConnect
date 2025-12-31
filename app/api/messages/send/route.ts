import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendSMS } from "@/lib/senders";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { renderTemplate } from "@/lib/template";

export async function POST(req: Request) {
  try {
    const { targets, message, type = "SMS", imageUrl } = await req.json();

    if (!targets || !message) {
      return NextResponse.json(
        { error: "targets and message are required" },
        { status: 400 }
      );
    }

    let recipients: {
      id: string;
      name?: string;
      contact: string;
      className?: string | null;
    }[] = [];

    // ✅ All students
    if (targets.includes("all")) {
      const students = await prisma.student.findMany({
        include: { class: true },
      });

      recipients = students.map((s) => ({
        id: s.id,
        name: s.name,
        contact: s.parentContact,
        className: s.class?.name ?? null,
      }));
    } else {
      for (const t of targets) {
        const student = await prisma.student.findUnique({
          where: { id: t },
          include: { class: true },
        });

        if (student) {
          recipients.push({
            id: student.id,
            name: student.name,
            contact: student.parentContact,
            className: student.class?.name ?? null,
          });
          continue;
        }

        const klass = await prisma.class.findUnique({
          where: { id: t },
          include: { students: { include: { class: true } } },
        });

        if (klass) {
          for (const s of klass.students) {
            recipients.push({
              id: s.id,
              name: s.name,
              contact: s.parentContact,
              className: klass.name,
            });
          }
        }
      }
    }

    // ✅ Deduplicate
    const deduped = Array.from(
      new Map(recipients.map((r) => [r.contact, r])).values()
    );

    const results = [];

    for (const r of deduped) {
      try {
        // 🔥 APPLY TEMPLATE PER RECIPIENT
        const finalMessage = renderTemplate(message, {
          student_name: r.name,
          class: r.className,
          date: new Date(),
        });

        if (type === "WHATSAPP") {
          await sendWhatsAppMessage(r.contact, finalMessage, imageUrl);
        } else {
          await sendSMS(r.contact, finalMessage);
        }

        results.push({ to: r.contact, ok: true });
      } catch (err: any) {
        results.push({
          to: r.contact,
          ok: false,
          error: err.message,
        });
      }
    }

    // ✅ Log rendered message
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
