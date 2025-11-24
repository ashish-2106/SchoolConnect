"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ClassType = {
  id: string;
  name: string;
};

export default function AddStudentPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    parentName: "",
    parentEmail: "",
    parentContact: "",
    classId: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      router.push("/admin/students");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">

      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Add Student</h1>

      <form onSubmit={onCreate} className="space-y-4">

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
          onChange={(e) => setForm({ ...form, parentContact: e.target.value })}
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          {loading ? "Adding..." : "Add Student"}
        </Button>
      </form>
    </div>
  );
}
