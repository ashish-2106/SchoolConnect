"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Plus, FileText, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type MessageLog = {
  id: string;
  sender: string;
  message: string;
  method: "SMS" | "EMAIL" | "WHATSAPP";
  targets: string[];
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 9000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/history");
      if (!res.ok) throw new Error("Failed to load logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("❌ Error fetching logs:", err);

      // fallback dummy log
      setLogs([
        {
          id: "dummy",
          sender: "Admin",
          message: "School will remain closed due to heavy rainfall.",
          method: "SMS",
          targets: ["All Students"],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const methodBadge = (method: string) => {
    const colors: any = {
      SMS: "bg-blue-100 text-blue-800",
      EMAIL: "bg-green-100 text-green-800",
      WHATSAPP: "bg-emerald-100 text-emerald-800",
    };

    return (
      <Badge className={`${colors[method]} px-2 py-1 rounded-md font-medium`}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Messages & Announcements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all message activity.
          </p>
        </div>

        {/* Buttons responsive */}
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Link href="/admin/messages/compose">
              <Plus className="w-4 h-4" /> Compose
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link href="/admin/messages/templates">
              <FileText className="w-4 h-4" /> Templates
            </Link>
          </Button>

          <Button
            variant="secondary"
            size="icon"
            title="Refresh"
            onClick={fetchLogs}
            disabled={loading}
            className="border bg-white hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* CARD */}
      <Card className="border shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="w-5 h-5 text-blue-600" />
            Message History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading message logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No messages found.
            </div>
          ) : (
            <>
              {/* TABLE WRAPPER */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="text-left border-b text-muted-foreground">
                      <th className="py-3 px-3 font-medium">Date</th>
                      <th className="px-3 font-medium">Method</th>
                      <th className="px-3 font-medium">Message</th>
                      <th className="px-3 font-medium">Targets</th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>

                        <td className="px-3">{methodBadge(log.method)}</td>

                        <td className="px-3 max-w-lg truncate" title={log.message}>
                          {log.message}
                        </td>

                        <td className="px-3">{log.targets.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE FRIENDLY LIST VIEW */}
              <div className="md:hidden flex flex-col gap-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {methodBadge(log.method)}
                    </div>

                    <p className="font-medium">{log.message}</p>

                    <p className="text-xs text-gray-600 mt-2">
                      Targets: {log.targets.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
