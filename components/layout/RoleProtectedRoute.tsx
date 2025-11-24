"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

/**
 * RoleProtectedRoute
 * Restricts page access based on Firebase Auth user and assigned role.
 * 
 * @param allowedRole - "admin" or "teacher"
 */
export function RoleProtectedRoute({
  allowedRole,
  children,
}: {
  allowedRole: "admin" | "teacher";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ Get custom role from your Supabase or Firestore if stored there
      try {
        const res = await fetch(`/api/users/role?uid=${user.uid}`);
        const data = await res.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  if (userRole !== allowedRole) {
    router.push("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
