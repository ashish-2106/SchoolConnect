"use client";

import { Card, CardContent } from "@/components/ui/card";

export function ClassTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Class</th>
              <th>Teacher</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2">{c.name}</td>
                <td>{c.teacher}</td>
                <td>{c.studentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
