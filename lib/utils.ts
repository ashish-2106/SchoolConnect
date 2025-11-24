import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Small classNames helper used across components.
 * Accepts strings, arrays, or objects with truthy values (like Tailwind's cn).
 */
export function cn(
  ...args: Array<string | false | null | undefined | Record<string, boolean>>
) {
  const out: string[] = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === "string") out.push(a);
    else if (Array.isArray(a)) out.push(cn(...a));
    else if (typeof a === "object") {
      for (const [k, v] of Object.entries(a)) if (v) out.push(k);
    }
  }
  return out.join(" ");
}

/**
 * Firebase helper — waits for the current user (client-side only)
 * Returns a Promise that resolves to the authenticated user or null.
 */
export function getCurrentUser(): Promise<any | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Role check helper for Firebase user roles.
 * Example: await isRole("ADMIN") → true/false
 * (Assumes roles are stored in your Prisma or Supabase DB)
 */
export async function isRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  try {
    const res = await fetch(`/api/users/role?uid=${user.uid}`);
    const data = await res.json();
    return data.role?.toUpperCase() === role.toUpperCase();
  } catch (err) {
    console.error("Error checking role:", err);
    return false;
  }
}
