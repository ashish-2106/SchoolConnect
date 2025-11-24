import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { classId, entries } = await req.json();

  // 1️⃣ Find last attendance record
  const last = await prisma.attendance.findFirst({
    where: { classId },
    orderBy: { date: "desc" },
  });

  if (last) {
    const lastDate = new Date(last.date);
    const now = new Date();

    const diffHours =
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

    // 🔐 Unlock attendance after 20 hours (NOT 24)
    const UNLOCK_HOURS = 20;

    if (diffHours < UNLOCK_HOURS) {
      return NextResponse.json(
        {
          error: `You must wait ${Math.ceil(
            UNLOCK_HOURS - diffHours
          )} more hours before taking attendance again.`,
        },
        { status: 403 }
      );
    }

    // 3️⃣ Block same-day attendance completely
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    if (lastDate >= start && lastDate <= end) {
      return NextResponse.json(
        { error: "Attendance already taken today." },
        { status: 403 }
      );
    }
  }

  // 4️⃣ Save attendance
  for (let entry of entries) {
    await prisma.attendance.create({
      data: {
        classId,
        studentId: entry.studentId,
        present: entry.present,
        date: new Date(),
      },
    });
  }

  return NextResponse.json({ success: true });
}
