// app/api/teachers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        classes: true,
      },
    });

    // ✅ Type-safe access after Prisma regenerate
    const payload = teachers.map((t) => ({
      id: t.id,
      name: t.user?.name ?? "Unnamed",
      email: t.user?.email ?? null,
      phone: t.phoneNumber ?? "",
      classes: t.classes?.length ?? 0,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const defaultPassword = process.env.DEFAULT_TEACHER_PASSWORD ?? "changeme123";
    const hashed = await bcrypt.hash(defaultPassword, 10);

    // Create user first
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "TEACHER",
      },
    });

    // Create teacher entry with phone
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        phoneNumber: phone ?? null,
      },
    });

    return NextResponse.json(
      {
        id: teacher.id,
        name: user.name,
        email: user.email,
        phone: teacher.phoneNumber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating teacher:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}
