"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Save teacherEmail to both storages
  const saveTeacherEmail = (email: string) => {
    try {
      localStorage.setItem("teacherEmail", email);
    } catch {}
    try {
      window.parent.localStorage.setItem("teacherEmail", email);
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        saveTeacherEmail(user.email);

        try {
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

          // 🔥 Direct Admin Email Check
          if (user.email === adminEmail) {
            router.push("/admin/dashboard");
            return;
          }

          // 🔥 Check Role
          const res = await fetch(`/api/users/role?email=${user.email}`);
          const data = await res.json();

          if (res.ok && data?.role) {
            if (data.role === "TEACHER") {
              saveTeacherEmail(user.email);
              router.push("/teacher/dashboard");
            } else if (data.role === "ADMIN") {
              router.push("/admin/dashboard");
            } else {
              router.push("/unauthorized");
            }
          } else {
            router.push("/unauthorized");
          }
        } catch (error) {
          console.error("Error checking role:", error);
          router.push("/unauthorized");
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Loading Screen
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-200 to-blue-300">
        <p className="text-gray-700 font-medium text-lg animate-pulse">
          Checking user...
        </p>
      </main>
    );
  }

  // Landing Page (No user logged in)
  if (!userEmail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-200 to-blue-300 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-gray-100">

          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img
              src="/lbslogo.png"
              alt="School Logo"
              className="h-24 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            LBS School Communication Portal
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 text-sm leading-relaxed">
            Instant communication system for Teachers & Admins.
            <br />
            Send SMS, WhatsApp alerts, announcements and more.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => router.push("/login")}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
