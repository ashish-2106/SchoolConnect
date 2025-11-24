"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Users,
  GraduationCap,
  School,
  MessageSquare,
  Loader2,
  ChevronRight,
  LogOut,
} from "lucide-react";

// ⬇️ Recharts
import {
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  teachers: number;
  classes: number;
  students: number;
  messagesSent: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // AUTH CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/(auth)/login");
        return;
      }

      try {
        const res = await fetch(`/api/users/role?email=${currentUser.email}`);
        const data = await res.json();

        if (data.role !== "ADMIN") {
          router.push("/unauthorized");
          return;
        }

        setUser(currentUser);
      } catch (err) {
        console.error("Role check failed:", err);
        router.push("/unauthorized");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // LOAD STATS
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setStats({ teachers: 0, classes: 0, students: 0, messagesSent: 0 });
      }
    }
    loadStats();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading dashboard...
      </div>
    );

  if (!user)
    return <div className="text-red-600 p-6">Unauthorized access.</div>;

  // Weekly messages (mock analytics from existing total)
  const weeklyMessages = stats
    ? [
      { day: "Mon", messages: Math.floor(stats.messagesSent * 0.15) },
      { day: "Tue", messages: Math.floor(stats.messagesSent * 0.12) },
      { day: "Wed", messages: Math.floor(stats.messagesSent * 0.20) },
      { day: "Thu", messages: Math.floor(stats.messagesSent * 0.18) },
      { day: "Fri", messages: Math.floor(stats.messagesSent * 0.35) },
    ]
    : [];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-6 pb-12">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-wide">
                Admin Dashboard
              </h1>
              <p className="opacity-90 text-sm mt-1">
                Welcome, {user.displayName ?? user.email}
              </p>
            </div>

            <Button
              variant="outline"
              className="mt-4 sm:mt-0 bg-white text-black hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* STATS */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Dashboard Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard
            title="Teachers"
            value={stats?.teachers ?? 0}
            icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Classes"
            value={stats?.classes ?? 0}
            icon={<School className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Students"
            value={stats?.students ?? 0}
            icon={<Users className="w-6 h-6 text-orange-500" />}
          />
          <StatCard
            title="Messages Sent"
            value={stats?.messagesSent ?? 0}
            icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* QUICK ACTIONS */}
        <Card className="border shadow-sm hover:shadow-md transition-all duration-200 mt-10">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="/admin/teachers" className="flex items-center gap-2">
                  Manage Teachers <ChevronRight className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="secondary">
                <a href="/admin/classes" className="flex items-center gap-2">
                  Manage Classes <ChevronRight className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="outline">
                <a href="/admin/messages" className="flex items-center gap-2">
                  Announcements <ChevronRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 🔵 PIE CHART */}
        <Card className="border shadow-sm mt-10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">School Composition</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Teachers", value: stats?.teachers ?? 0, fill: "#4F46E5" }, // Indigo
                    { name: "Classes", value: stats?.classes ?? 0, fill: "#10B981" },  // Green
                    { name: "Students", value: stats?.students ?? 0, fill: "#F59E0B" }, // Amber
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, value }) => `${name}: ${value}`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 16, padding: 10 }}
                  itemStyle={{ fontSize: 16 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        {/* 🟦 BAR CHART */}
        {/* 🟦 BAR CHART */}
        <Card className="border shadow-sm mt-10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Messages Trend</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyMessages} barSize={45}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 16, fontWeight: "600" }}
                />
                <YAxis
                  tick={{ fontSize: 16, fontWeight: "600" }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 16 }}
                  itemStyle={{ fontSize: 16 }}
                />
                <Bar
                  dataKey="messages"
                  fill="#6366F1"     // Nice Purple
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

     

      </div>
    </div>
  );
}

// REUSABLE STAT CARD
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number | undefined;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border shadow-sm hover:shadow-lg transition-all duration-200 rounded-xl">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      </CardContent>
    </Card>
  );
}
