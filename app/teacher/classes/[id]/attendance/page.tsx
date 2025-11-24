"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AttendancePage() {
  const { id } = useParams();
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [className, setClassName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 🔐 Locking states
  const [attendanceTakenToday, setAttendanceTakenToday] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [remainingHours, setRemainingHours] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        // 1️⃣ Check if attendance taken today
        const todayRes = await fetch("/api/attendance/check", {
          method: "POST",
          body: JSON.stringify({ classId: id }),
        });

        const todayData = await todayRes.json();
        if (todayData.taken) {
          setAttendanceTakenToday(true);
          setAllowed(false);
        }

        // 2️⃣ Fetch last attendance timestamp
        const lastRes = await fetch("/api/attendance/last", {
          method: "POST",
          body: JSON.stringify({ classId: id }),
        });

        const lastData = await lastRes.json();

        if (lastData.lastDate) {
          const lastDate = new Date(lastData.lastDate);
          const now = new Date();

          const diffHours =
            (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

          const UNLOCK_HOURS = 10; // 🔥 unlock after 20 hours

          if (diffHours >= UNLOCK_HOURS) {
            setAllowed(true);
          } else {
            setRemainingHours(Math.ceil(UNLOCK_HOURS - diffHours));
            setAllowed(false);
          }
        } else {
          // No attendance ever → allow
          setAllowed(true);
        }

        // 3️⃣ Load students
        const stuRes = await fetch(`/api/classes/${id}/students`);
        const stuData = await stuRes.json();
        if (stuData?.students) {
          setStudents(stuData.students);
          setClassName(stuData.class?.name || "");
          const initial = Object.fromEntries(
            stuData.students.map((s: any) => [s.id, true])
          );
          setAttendance(initial);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleToggle = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async () => {
    const presentIds = Object.keys(attendance).filter((id) => attendance[id]);
    const absentIds = Object.keys(attendance).filter((id) => !attendance[id]);

    setSubmitting(true);

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: id,
          presentIds,
          absentIds,
        }),
      });

      if (!res.ok) {
        alert("Failed to save attendance.");
        return;
      }

      alert("Attendance saved successfully!");
      router.back();
    } catch (e) {
      alert("Error saving attendance.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // 🌀 Loading UI
  if (loading)
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
      </div>
    );

  // ⛔ Attendance already taken today
  if (attendanceTakenToday) {
    return (
      <div className="p-8">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <h1 className="text-xl font-semibold mb-4">Attendance Already Taken</h1>
        <p className="text-red-500">
          You have already taken attendance for this class today.
        </p>
      </div>
    );
  }

  // ⛔ Locked (less than 20 hours passed)
  if (!allowed) {
    return (
      <div className="p-8">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <h1 className="text-xl font-semibold mb-4">Attendance Locked</h1>
        <p className="text-red-600">
          You can take attendance only after 20 hours from the previous one.
        </p>

        {remainingHours !== null && (
          <p className="mt-2 text-gray-700">
            Please wait <b>{remainingHours} more hours</b>.
          </p>
        )}
      </div>
    );
  }

  // 🟢 Allowed — Show attendance page
  return (
    <div className="p-8">
      <div className="mb-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">
        Mark Attendance for {className || id}
      </h1>

      <Card className="max-w-lg">
        <CardContent className="p-4 space-y-3">
          {students.length === 0 ? (
            <p className="text-muted-foreground text-center">
              No students found for this class.
            </p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={attendance[student.id] ?? false}
                  onCheckedChange={() => handleToggle(student.id)}
                />
                <span>
                  {student.name}{" "}
                  {!attendance[student.id] && (
                    <span className="text-red-500 text-sm">(Absent)</span>
                  )}
                </span>
              </div>
            ))
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Submit Attendance"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
