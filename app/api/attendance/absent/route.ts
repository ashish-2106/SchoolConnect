import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { teacherEmail } = await req.json();

    if (!teacherEmail) {
      return NextResponse.json([]);
    }

    // 1️⃣ Find teacher using email
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: teacherEmail,
        },
      },
      include: { user: true },
    });

    if (!teacher) return NextResponse.json([]);

    // 2️⃣ Get all classes taught by this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId: teacher.id },
      select: { id: true },
    });

    const classIds = classes.map((c) => c.id);

    if (classIds.length === 0) return NextResponse.json([]);

    // 3️⃣ Today range (IST)
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 4️⃣ Get absentees of that teacher’s class today
    const absents = await prisma.attendance.findMany({
      where: {
        classId: { in: classIds },
        present: false,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(absents);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
