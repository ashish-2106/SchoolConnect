"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Klass = {
  id: string;
  name: string;
  teacherId?: string;
  teacherName?: string;
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Klass[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({ name: "", teacherId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/teachers"),
      ]);
      const [cData, tData] = await Promise.all([
        cRes.ok ? cRes.json() : [],
        tRes.ok ? tRes.json() : [],
      ]);
      setClasses(cData);
      setTeachers(tData.map((t: any) => ({ id: t.id, name: t.name })));
    } catch (e) {
      setClasses([{ id: "c1", name: "Grade 1", teacherId: "t1", teacherName: "Alice" }]);
      setTeachers([{ id: "t1", name: "Alice" }]);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", teacherId: "" });
      await fetchData();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this class?")) return;
    await fetch(`/api/classes/${id}`, { method: "DELETE" });
    await fetchData();
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Classes</h1>
        <Button asChild>
          <Link href="/admin/teachers">
            <Users className="w-4 h-4 mr-2" /> Manage Teachers
          </Link>
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Class Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Create a New Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <Input
                placeholder="Class name (e.g. Grade 3 - A)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Select
                value={form.teacherId}
                onValueChange={(value) => setForm({ ...form, teacherId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Class"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Class List Card */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Class List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.teacherName ?? "—"}</TableCell>
                      <TableCell className="flex gap-3">
                        <Link
                          href={`/admin/classes/${c.id}/students`}
                          className="text-blue-600 hover:underline"
                        >
                          Students
                        </Link>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {classes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                        No classes found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
