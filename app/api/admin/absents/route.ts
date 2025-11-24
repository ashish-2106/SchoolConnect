import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Fetch all absentees
    const absents = await prisma.attendance.findMany({
      where: {
        present: false,
        date: { gte: start, lte: end },
      },
      include: {
        student: true,
        class: true,
      },
      orderBy: { classId: "asc" },
    });

    // Group by class
    const grouped: Record<string, any[]> = {};

    absents.forEach((a) => {
      const className = a.class?.name || "Unknown Class";

      if (!grouped[className]) grouped[className] = [];
      grouped[className].push(a.student);
    });

    return NextResponse.json({ grouped });
  } catch (error) {
    console.error("Admin absents error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
