"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone?: string | number | null;
};

export default function EditTeacherPage() {
  const { id } = useParams();
  const router = useRouter();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacher() {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        if (!res.ok) throw new Error("Teacher not found");
        const data = await res.json();

        // 🔥 MAIN FIX — Convert phone to string always
        setTeacher({
          ...data,
          phone: data.phone ? String(data.phone) : "",
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeacher();
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!teacher) return;

    setSaving(true);

    try {
      await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },

        // 🔥 phone is guaranteed string now
        body: JSON.stringify({
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || null,
        }),
      });

      router.push("/admin/teachers");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading teacher details...
      </div>
    );
  }

  if (!teacher) {
    return <div className="text-center text-red-600 mt-10">Teacher not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10">

      {/* BACK BUTTON */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Edit Teacher</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSave} className="space-y-4">

            <div>
              <label className="text-sm mb-1 block">Name</label>
              <Input
                value={teacher.name}
                onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm mb-1 block">Email</label>
              <Input
                type="email"
                value={teacher.email}
                onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm mb-1 block">Phone</label>

              <Input
                value={teacher.phone ?? ""}
                onChange={(e) =>
                  setTeacher({ ...teacher, phone: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              <Button variant="secondary" type="button" onClick={() => router.push("/admin/teachers")}>
                Cancel
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
