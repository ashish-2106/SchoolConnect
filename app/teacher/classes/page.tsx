"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardList, Users, ArrowLeft } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("No user logged in");
        setLoading(false);
        setClasses([]);
        return;
      }

      try {
        const url = `/api/teachers/dashboard?email=${encodeURIComponent(
          user.email ?? ""
        )}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch classes", res.status);
          setClasses([]);
          return;
        }

        const data = await res.json();
        setClasses(data.classes || []);
      } catch (e) {
        console.error("Error fetching classes:", e);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12 text-muted-foreground text-base">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
      </div>
    );

  return (
    
    <div className="px-4 py-6 sm:px-6 lg:px-3">
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

      <h1 className="text-xl sm:text-2xl font-semibold mb-6">My Classes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <p className="text-muted-foreground">No classes assigned.</p>
        ) : (
          classes.map((cls) => (
            <Card
              key={cls.id}
              className="p-4 hover:shadow-md rounded-xl border transition"
            >
              <CardContent className="p-0 space-y-3">
                <div>
                  <h2 className="font-medium text-lg">{cls.name}</h2>
                  <p className="text-sm text-gray-500">
                    {cls.studentCount ?? 0} students
                  </p>
                </div>

                {/* Buttons Responsive */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href={`/teacher/classes/${cls.id}/students`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <Users className="w-4 h-4" /> View Students
                    </Button>
                  </Link>

                  <Link
                    href={`/teacher/classes/${cls.id}/attendance`}
                    className="flex-1"
                  >
                    <Button
                      className="w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <ClipboardList className="w-4 h-4" /> Mark Attendance
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
