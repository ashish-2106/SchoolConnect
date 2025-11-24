import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // ⭐ Check Admin Email from ENV
    if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({
        role: "ADMIN",
        teacherEmail: null
      });
    }

    // ⭐ Lookup the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({
        role: "UNKNOWN",
        teacherEmail: null,
      }, { status: 404 });
    }

    // ⭐ If teacher → return teacherEmail for frontend storage
    if (user.role === "TEACHER") {
      return NextResponse.json({
        role: "TEACHER",
        teacherEmail: email, // 🔥 Important!
      });
    }

    // ⭐ Default for other roles
    return NextResponse.json({
      role: user.role,
      teacherEmail: null
    });

  } catch (err) {
    console.error("Role fetch failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
