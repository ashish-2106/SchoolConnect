import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// ✅ Fetch all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: { class: true },
      orderBy: { name: "asc" },
    });

    const payload = students.map((s) => ({
      id: s.id,
      name: s.name,
      parentName: s.parentName ?? "",     // handle optional gracefully
      parentEmail: s.parentEmail ?? "",
      parentContact: s.parentContact,
      className: s.class?.name ?? null,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/students error:", err);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// ✅ Create a new student
export async function POST(req: Request) {
  try {
    const { name, parentName, parentEmail, parentContact, classId } =
      await req.json();

    // Validation (keep optional consistent with Prisma)
    if (!name || !parentContact) {
      return NextResponse.json(
        { error: "Name and parent contact are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
        parentName: parentName?.trim() || null,
        parentEmail: parentEmail?.trim() || null,
        parentContact: parentContact.trim(),
        classId: classId || null,
      },
      include: { class: true },
    });

    return NextResponse.json(
      {
        id: student.id,
        name: student.name,
        parentName: student.parentName ?? "",
        parentEmail: student.parentEmail ?? "",
        parentContact: student.parentContact,
        className: student.class?.name ?? null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/students error:", err);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
