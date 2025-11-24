"use client";

import { Card, CardContent } from "@/components/ui/card";

export function MessageTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Date</th>
              <th>Recipient</th>
              <th>Mode</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="py-2">{m.date}</td>
                <td>{m.recipient}</td>
                <td>{m.mode}</td>
                <td>{m.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
