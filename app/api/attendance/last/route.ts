import prisma from "@/lib/db";
import { NextResponse } from "next/server";

function getIST(d: Date) {
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  const { classId } = await req.json();

  const last = await prisma.attendance.findFirst({
    where: { classId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    lastDate: last ? getIST(new Date(last.date)) : null,
  });
}
