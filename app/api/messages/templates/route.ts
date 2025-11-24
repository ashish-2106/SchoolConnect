// app/api/messages/templates/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const templates = await prisma.messageTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const { name, content } = await req.json();
  if (!name || !content) return NextResponse.json({ error: "name and content required" }, { status: 400 });

  const tpl = await prisma.messageTemplate.create({
    data: { name, content },
  });

  return NextResponse.json(tpl, { status: 201 });
}
