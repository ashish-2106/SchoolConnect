// app/api/messages/templates/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.messageTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
