// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Count records in each table
    const [teachers, classes, students, messagesSent] = await Promise.all([
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.student.count(),
      prisma.message.count(),
    ]);

    return NextResponse.json({
      teachers,
      classes,
      students,
      messagesSent,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
