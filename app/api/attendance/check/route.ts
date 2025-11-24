import prisma from "@/lib/db";
import { NextResponse } from "next/server";

function getIST(d: Date) {
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  const { classId } = await req.json();

  const nowIST = getIST(new Date());
  const start = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 0, 0, 0);
  const end = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59);

  const existing = await prisma.attendance.findFirst({
    where: {
      classId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  return NextResponse.json({
    taken: existing ? true : false,
  });
}
