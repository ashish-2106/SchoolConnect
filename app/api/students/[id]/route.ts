// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Context = {
  params: {
    id: string;
  };
};

// ✅ GET student by ID
export async function GET(
  _req: NextRequest,
  context: Context
) {
  const { id } = context.params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(student);
}

// ✅ UPDATE student
export async function PUT(
  req: NextRequest,
  context: Context
) {
  const { id } = context.params;
  const body = await req.json();

  const { name, parentContact, classId } = body;

  const student = await prisma.student.update({
    where: { id },
    data: {
      name,
      parentContact,
      classId: classId ?? undefined,
    },
  });

  return NextResponse.json(student);
}

// ✅ DELETE student
export async function DELETE(
  _req: NextRequest,
  context: Context
) {
  const { id } = context.params;

  await prisma.student.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
