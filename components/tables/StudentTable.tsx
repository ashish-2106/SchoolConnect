"use client";

import { Card, CardContent } from "@/components/ui/card";

export function StudentTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Name</th>
              <th>Class</th>
              <th>Parent Email</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.name}</td>
                <td>{s.className}</td>
                <td>{s.parentEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
