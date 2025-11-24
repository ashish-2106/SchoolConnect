"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AbsentsPage() {
  const [absents, setAbsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        console.log("❌ User not logged in");
        setLoading(false);
        return;
      }

      const teacherEmail = user.email;
      console.log("Teacher Email from Firebase:", teacherEmail);

      const res = await fetch("/api/teachers/absents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherEmail }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      setAbsents(data.absents || []);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center mt-10 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading Absentees...
      </div>
    );

  return (
    <div className="p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/teacher/dashboard">
          <Button
            variant="outline"
            className="flex items-center gap-2 w-max text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4">Today's Absentees</h1>

      {absents.length === 0 ? (
        <p className="text-gray-500">No absentees today 🎉</p>
      ) : (
        <ul className="space-y-2">
          {absents.map((student) => (
            <li key={student.id} className="p-3 bg-red-50 border rounded">
              {student.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
