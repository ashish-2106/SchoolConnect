"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminAbsentsPage() {
  const [absents, setAbsents] = useState<Record<string, any[]> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/absents");
      const data = await res.json();
      setAbsents(data.grouped || {});
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center mt-10 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading Absentees...
      </div>
    );

  if (!absents || Object.keys(absents).length === 0)
    return <p className="p-8">No absentees today 🎉</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Today's Absentees (All Classes)</h1>

      <div className="space-y-6">
        {Object.keys(absents).map((className) => (
          <div key={className} className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{className}</h2>

            <ul className="space-y-1">
              {absents[className].map((student) => (
                <li key={student.id} className="p-2 bg-red-50 border rounded">
                  {student.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
