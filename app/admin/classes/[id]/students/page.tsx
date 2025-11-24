"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type Student = {
  id: string;
  name: string;
  parentContact: string;
};

export default function ClassStudentsPage() {
  const { id: classId } = useParams();
  const router = useRouter();

  const [className, setClassName] = useState<string>("Class");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClass();       // NEW IMPORTANT FIX
    loadStudents();
  }, [classId]);

  // 🔥 FIX: Load real class name
  async function loadClass() {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      if (!res.ok) throw new Error("Failed to load class");
      const data = await res.json();
      setClassName(data.name); // <-- your 'Class 12'
    } catch (err) {
      console.error("Class fetch error", err);
    }
  }

  async function loadStudents() {
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/students`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStudents(data.students ?? []);
    } catch {
      console.error("Failed loading students");
    } finally {
      setLoading(false);
    }
  }

  async function deleteStudent(id: string) {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    await loadStudents();
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Heading with real class name */}
      <h1 className="text-3xl font-semibold">
        {className}th Students
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg">Student List</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading students...
              </div>
            ) : (
              <ScrollArea className="h-[350px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.parentContact}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteStudent(s.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                          No students found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
