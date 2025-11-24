import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing class id" },
        { status: 400 }
      );
    }

    // ✅ Fetch class with students
    const classData = await prisma.class.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!classData) {
      return NextResponse.json(
        { ok: false, error: "Class not found" },
        { status: 404 }
      );
    }

    const students = classData.students.map((s) => ({
      id: s.id,
      name: s.name,
      parentName: s.parentName ?? null,
      parentEmail: s.parentEmail ?? null,
      parentContact: s.parentContact ?? null,
      classId: s.classId,
    }));

    return NextResponse.json(
      {
        ok: true,
        class: { id: classData.id, name: classData.name },
        students,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error in GET /api/classes/[id]/students:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
