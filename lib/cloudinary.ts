import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImage(filePath: string) {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: "schoolconnect",
      resource_type: "image",
    });
    console.log("✅ Uploaded to Cloudinary:", res.secure_url);
    return res.secure_url; // Direct HTTPS URL for Twilio
  } catch (err: any) {
    console.error("❌ Cloudinary upload failed:", err.message);
    throw err;
  }
}
