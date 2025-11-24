import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing teacher email" },
        { status: 400 }
      );
    }

    // 1️⃣ Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { teacher: true },
    });

    if (!user || !user.teacher) {
      return NextResponse.json(
        { error: "Teacher record not found for this user" },
        { status: 404 }
      );
    }

    const teacherId = user.teacher.id;

    // 2️⃣ Get teacher's classes + students
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        classes: {
          include: {
            students: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Format the data for the dashboard
    const data = {
      teacherName: user.name,
      teacherEmail: user.email,
      totalClasses: teacher.classes.length,
      totalStudents: teacher.classes.reduce(
        (sum, c) => sum + c.students.length,
        0
      ),
      classes: teacher.classes.map((c) => ({
        id: c.id,
        name: c.name,
        studentCount: c.students.length,
      })),
    };

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Teacher dashboard error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
