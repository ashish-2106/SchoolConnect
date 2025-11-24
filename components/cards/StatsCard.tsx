"use client";

import { Card, CardContent } from "@/components/ui/card";

export function StatsCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition">
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </CardContent>
    </Card>
  );
}
