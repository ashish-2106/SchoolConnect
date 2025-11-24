// app/api/classes/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: Context) {
  try {
    const { id } = await context.params;
    const klass = await prisma.class.findUnique({
      where: { id },
      include: { students: true, teacher: { include: { user: true } } },
    });

    if (!klass) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: klass.id,
      name: klass.name,
      teacher: klass.teacher?.user ?? null,
      students: klass.students,
    });
  } catch (err) {
    console.error("Error loading class:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const { name, teacherId } = await req.json();

    const updated = await prisma.class.update({
      where: { id },
      data: { name: name ?? undefined, teacherId: teacherId ?? undefined },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating class:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const { id } = await context.params;
    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error deleting class:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
