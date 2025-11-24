// app/api/students/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const student = await prisma.student.findUnique({ where: { id }, include: { class: true } });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json();
  const { name, parentContact, classId } = body;

  const student = await prisma.student.update({
    where: { id },
    data: { name, parentContact, classId: classId ?? undefined },
  });

  return NextResponse.json(student);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
