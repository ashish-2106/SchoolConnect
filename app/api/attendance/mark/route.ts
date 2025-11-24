import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendSMS } from "@/lib/senders";

function getIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const { classId, presentIds, absentIds } = await req.json();

    if (!classId) {
      return NextResponse.json(
        { ok: false, error: "Missing classId" },
        { status: 400 }
      );
    }

    const nowIST = getIST();

    // 1️⃣ Save attendance using UPSERT
    for (const studentId of [...presentIds, ...absentIds]) {
      const present = presentIds.includes(studentId);

      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: nowIST,
          },
        },
        update: { present },
        create: {
          studentId,
          classId,
          date: nowIST,
          present,
        },
      });
    }

    // 2️⃣ Send notifications to absent students
    if (absentIds.length > 0) {
      const absentees = await prisma.student.findMany({
        where: { id: { in: absentIds } },
      });

      for (const student of absentees) {
        if (!student.parentContact) continue;

        const message = `Hello! This is School Connect. Your child ${student.name} was marked absent on ${nowIST.toLocaleDateString(
          "en-IN"
        )}.`;

        await sendSMS(student.parentContact, message);
      }
    }

    // 3️⃣ AUTO-DELETE ATTENDANCE OLDER THAN 20 HOURS
    const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000);

    await prisma.attendance.deleteMany({
      where: {
        date: { lt: cutoff },
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Attendance saved, notifications sent, and old records cleared (older than 20 hours).",
    });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    return NextResponse.json(
      { ok: false, error: "Server error while marking attendance" },
      { status: 500 }
    );
  }
}
