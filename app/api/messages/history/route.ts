import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // ✅ Fetch recent messages (latest first)
    const msgs = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // ✅ Transform into frontend-friendly format
    const payload = msgs.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      message: m.message,
      method: m.type, // "SMS" or "WHATSAPP"
      targets: m.targets,
      imageUrl: (m as any).imageUrl ?? null, // optional field for WhatsApp media
      createdAt: m.createdAt,
      formattedTime: m.createdAt.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }));

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("❌ Error fetching message history:", err);
    return NextResponse.json(
      { error: "Failed to fetch message history", details: err.message },
      { status: 500 }
    );
  }
}
