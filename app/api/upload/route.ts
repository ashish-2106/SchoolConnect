import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const tempPath = path.join("/tmp", file.name);
  fs.writeFileSync(tempPath, buffer);

  const imageUrl = await uploadImage(tempPath);
  fs.unlinkSync(tempPath);

  return NextResponse.json({ imageUrl });
}
