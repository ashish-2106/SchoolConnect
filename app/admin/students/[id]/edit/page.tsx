"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ClassType = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  name: string;
  parentName?: string;
  parentEmail?: string;
  parentContact: string;
  classId?: string;
};

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams();

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Student>({
    id: "",
    name: "",
    parentName: "",
    parentEmail: "",
    parentContact: "",
    classId: "",
  });

  // ---------------------------
  // Load student details
  // ---------------------------
  useEffect(() => {
    loadStudent();
    loadClasses();
  }, []);

  async function loadStudent() {
    try {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();

      setForm({
        id: data.id,
        name: data.name,
        parentName: data.parentName ?? "",
        parentEmail: data.parentEmail ?? "",
        parentContact: data.parentContact,
        classId: data.classId ?? "",
      });

    } catch (e) {
      console.error(e);
      alert("Failed to load student.");
    } finally {
      setLoading(false);
    }
  }

  async function loadClasses() {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data);
  }

  // ---------------------------
  // Save Changes
  // ---------------------------
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      router.push("/admin/students");

    } catch (err) {
      console.error(err);
      alert("Failed to update student");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------
  // UI
  // ---------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading student details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">

      {/* Back Button */}
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Edit Student</h1>

      <form onSubmit={onSave} className="space-y-4">

        <Input
          placeholder="Student Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <Input
          placeholder="Parent Name"
          value={form.parentName}
          onChange={(e) => setForm({ ...form, parentName: e.target.value })}
          required
        />

        <Input
          placeholder="Parent Email (optional)"
          value={form.parentEmail}
          onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
          type="email"
        />

        <Input
          placeholder="Parent Contact"
          value={form.parentContact}
          onChange={(e) =>
            setForm({ ...form, parentContact: e.target.value })
          }
          required
        />

        <select
          className="w-full border border-gray-300 rounded p-2"
          value={form.classId}
          onChange={(e) => setForm({ ...form, classId: e.target.value })}
          required
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Save Button */}
        <Button type="submit" disabled={saving} className="w-full">
          {saving && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
