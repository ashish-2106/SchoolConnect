import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// Convert IST time to UTC once
function ISTtoUTC(date: Date) {
  return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const { teacherEmail } = await req.json();

    if (!teacherEmail) {
      return NextResponse.json({ absents: [] });
    }

    // 1️⃣ Find teacher & their classes
    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: teacherEmail } },
      include: { classes: true },
    });

    if (!teacher || teacher.classes.length === 0) {
      return NextResponse.json({ absents: [] });
    }

    // teacher.classes = array → use ALL classIds
    const classIds = teacher.classes.map((c) => c.id);

    // 2️⃣ Build TODAY range in IST
    const now = new Date();

    // Create an IST version of now
    const IST_now = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    // Start-of-day IST
    const startIST = new Date(IST_now);
    startIST.setHours(0, 0, 0, 0);

    // End-of-day IST
    const endIST = new Date(IST_now);
    endIST.setHours(23, 59, 59, 999);

    // Convert BOTH to UTC exactly once
    const startUTC = ISTtoUTC(startIST);
    const endUTC = ISTtoUTC(endIST);

    console.log("Filtering Range:", { startUTC, endUTC, classIds });

    // 3️⃣ Query absents across ALL teacher classes for TODAY
    const absents = await prisma.attendance.findMany({
      where: {
        classId: { in: classIds },
        present: false,
        date: {
          gte: startUTC,
          lte: endUTC,
        },
      },
      include: { student: true, class: true },
      orderBy: { classId: "asc" },
    });

    return NextResponse.json({
      absents: absents.map((x) => ({
        id: x.studentId,
        name: x.student.name,
        class: x.class?.name,
      })),
    });
  } catch (err) {
    console.error("ABSENT API ERROR:", err);
    return NextResponse.json({ absents: [] });
  }
}
