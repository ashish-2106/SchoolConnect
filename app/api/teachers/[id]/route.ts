import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// -------------------------------
// GET Teacher by ID
// -------------------------------
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,     // name, email from User
      classes: true,  // class relation
    },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: teacher.id,
    name: teacher.user.name,
    email: teacher.user.email,
    phone: teacher.phoneNumber ?? "", // ✅ correct field
    classes: teacher.classes,
  });
}

// -------------------------------
// UPDATE Teacher
// -------------------------------
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const { name, email, phone } = await req.json();

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  // Update User (name + email)
  await prisma.user.update({
    where: { id: teacher.userId },
    data: {
      name: name ?? teacher.user.name,
      email: email ?? teacher.user.email,
    },
  });

  // Update Teacher phone number
  const updatedTeacher = await prisma.teacher.update({
    where: { id },
    data: {
      phoneNumber: phone ?? teacher.phoneNumber,
    },
  });

  return NextResponse.json({ ok: true, teacher: updatedTeacher });
}

// -------------------------------
// DELETE Teacher
// -------------------------------
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  await prisma.teacher.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
