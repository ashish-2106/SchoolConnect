"use client";

import { Card, CardContent } from "@/components/ui/card";

export function TeacherTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2">{t.name}</td>
                <td>{t.email}</td>
                <td>{t.subject}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
