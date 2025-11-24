"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params.id;

  const [students, setStudents] = useState<any[]>([]);
  const [className, setClassName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/classes/${id}/students`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((json) => {
        setStudents(json.students || []);
        setClassName(json.class?.name || id);
      })
      .catch((err) => {
        console.error(err);
        setStudents([]);
        setClassName(id);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-32 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading students...
      </div>
    );

  return (
    <div className="p-6">
      {/* ✅ Back button */}
      <div className="mb-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Students for {className}
      </h1>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.id} className="border p-3 rounded-md">
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
