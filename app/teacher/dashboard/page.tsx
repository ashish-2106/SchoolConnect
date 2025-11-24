"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  LogOut,
  Users,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  UserX,
  ChevronRight,
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      try {
        const url = `/api/teachers/dashboard?email=${encodeURIComponent(
          user.email ?? ""
        )}`;

        const res = await fetch(url);
        if (!res.ok) {
          console.error("Dashboard API failed", res.status);
          setData(null);
        } else {
          const json = await res.json();
          setData(json);

          try {
            localStorage.setItem("teacherEmail", json.teacherEmail);
          } catch { }
        }
      } catch (e) {
        console.error("Dashboard error", e);
        setData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading dashboard...
      </div>
    );

  if (!data)
    return (
      <div className="p-8 text-center text-red-600">
        No data found for your account.
      </div>
    );

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-6 pb-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-wide">
                Welcome, Mr. {data.teacherName}
              </h1>
              <p className="text-sm opacity-90 mt-1">{data.teacherEmail}</p>
            </div>

            <Button
              variant="outline"
              className="mt-4 sm:mt-0 bg-white text-black hover:bg-gray-100"
              onClick={async () => {
                await signOut(auth);
                router.push("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Dashboard Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card className="hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Classes</p>
                  <h3 className="text-3xl font-semibold">{data.totalClasses}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-100">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <h3 className="text-3xl font-semibold">{data.totalStudents}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-yellow-100">
                  <ClipboardList className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending Attendance</p>
                  <h3 className="text-3xl font-semibold">—</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation Section */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mt-10">
          <CardContent className="">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

            <div className="flex flex-wrap gap-3">

              <Button asChild>
                <a href="/teacher/classes" className="flex items-center gap-2">
                  My Classes <ChevronRight className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="secondary">
                <a href="/teacher/absents" className="flex items-center gap-2">
                  View Absents <ChevronRight className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href="/teacher/classes" className="flex items-center gap-2">
                  Mark Attendance <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
