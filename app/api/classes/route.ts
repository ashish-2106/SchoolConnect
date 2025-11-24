// app/api/classes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: { teacher: { include: { user: true } }, students: true },
    });

    const payload = classes.map((c) => ({
      id: c.id,
      name: c.name,
      teacherId: c.teacherId,
      teacherName: c.teacher?.user?.name ?? null,
      studentCount: c.students?.length ?? 0,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error fetching classes:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, teacherId } = body;
    if (!name)
      return NextResponse.json({ error: "name required" }, { status: 400 });

    const created = await prisma.class.create({
      data: { name, teacherId: teacherId ?? undefined },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Error creating class:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
