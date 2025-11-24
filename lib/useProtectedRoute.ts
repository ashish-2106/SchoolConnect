"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useProtectedRoute(allowedRole: "ADMIN" | "TEACHER") {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/(auth)/login");
        return;
      }

      try {
        const res = await fetch(`/api/users/role?email=${firebaseUser.email}`);
        const data = await res.json();

        if (data.role !== allowedRole) {
          router.push("/unauthorized");
        } else {
          setUser(firebaseUser);
        }
      } catch (error) {
        console.error("Error verifying user role:", error);
        router.push("/unauthorized");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, allowedRole]);

  return { user, loading };
}
