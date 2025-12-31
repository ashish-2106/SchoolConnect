export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// ===============================
// GET: Fetch all templates
// ===============================
export async function GET() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates, { status: 200 });
  } catch (err) {
    console.error("GET /api/messages/templates error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

// ===============================
// POST: Create a template
// ===============================
export async function POST(req: Request) {
  try {
    const { name, content } = await req.json();

    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Template name and content are required" },
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name: name.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("POST /api/messages/templates error:", err);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
