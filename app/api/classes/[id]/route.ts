// app/api/classes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// -------------------------------
// GET Class by ID
// -------------------------------
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const klass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        teacher: { include: { user: true } },
      },
    });

    if (!klass) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: klass.id,
      name: klass.name,
      teacher: klass.teacher?.user ?? null,
      students: klass.students,
    });
  } catch (err) {
    console.error("Error loading class:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// -------------------------------
// UPDATE Class
// -------------------------------
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { name, teacherId } = await request.json();

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name: name ?? undefined,
        teacherId: teacherId ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating class:", err);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

// -------------------------------
// DELETE Class
// -------------------------------
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    await prisma.class.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error deleting class:", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
