// app/api/attendance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendSMS } from "@/lib/senders";
import { sendEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { classId, records, teacherEmail, notifyMethod } = await req.json();

    if (!classId || !Array.isArray(records)) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Optional owner check
    if (teacherEmail) {
      const valid = await prisma.class.findFirst({
        where: { id: classId, teacher: { user: { email: teacherEmail } } },
      });
      if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // normalize to today's start/end
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // remove existing attendance records for this class/day
    await prisma.attendance.deleteMany({
      where: {
        classId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    // insert new records
    await Promise.all(
      records.map((r: any) =>
        prisma.attendance.create({
          data: {
            studentId: r.studentId,
            classId,
            date: new Date(),
            present: !!r.present,
          },
        })
      )
    );

    // notify absentees (batch fetch)
    const absents = records.filter((r: any) => !r.present);
    if (absents.length > 0) {
      const ids = absents.map((a) => a.studentId);
      const students = await prisma.student.findMany({ where: { id: { in: ids } } });

      for (const s of students) {
        const msg = `Your child ${s.name} was absent on ${new Date().toLocaleDateString()}.`;
        try {
          if (notifyMethod === "EMAIL" && s.parentEmail) await sendEmail(s.parentEmail, "Absence Notice", msg);
          else if (notifyMethod === "WHATSAPP") await sendWhatsAppMessage(s.parentContact, msg);
          else await sendSMS(s.parentContact, msg);
        } catch (e) {
          console.warn("Notify failure for", s.id, e);
        }
      }
    }

    return NextResponse.json({ success: true, absents: absents.length }, { status: 200 });
  } catch (err) {
    console.error("Attendance error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
