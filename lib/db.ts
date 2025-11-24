// lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const prisma =
  globalThis.__prismaClient ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.__prismaClient = prisma;

// Optional graceful disconnect
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });
}

export default prisma;
