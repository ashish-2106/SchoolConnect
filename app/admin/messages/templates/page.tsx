"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

type Template = { id: string; name: string; content: string };

export default function MessageTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", content: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/templates");
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data);
    } catch {
      setTemplates([
        {
          id: "tpl1",
          name: "Absent Notice",
          content: "Your child [student_name] was absent on [date].",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/messages/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = res.ok
        ? await res.json()
        : { id: `tpl-${Date.now()}`, ...form };
      setTemplates((prev) => [created, ...prev]);
      setForm({ name: "", content: "" });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete template?")) return;
    await fetch(`/api/messages/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <h1 className="text-2xl font-semibold">Message Templates</h1>
        </div>

        <Button
          variant="secondary"
          onClick={() => router.push("/admin/messages")}
        >
          Back to Messages
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Template */}
        <div className="p-5 border rounded-2xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3 text-lg">Create Template</h2>
          <form onSubmit={onCreate} className="space-y-3">
            <input
              className="w-full border rounded-md p-2"
              placeholder="Template name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
            <textarea
              className="w-full border rounded-md p-2 h-28"
              placeholder="Content — supports [student_name], [date], etc."
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={creating}
            >
              {creating && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {creating ? "Creating..." : "Create Template"}
            </Button>
          </form>
        </div>

        {/* Templates List */}
        <div className="p-5 border rounded-2xl bg-white shadow-sm">
          <h2 className="font-semibold mb-3 text-lg">Saved Templates</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading templates...
            </div>
          ) : (
            <>
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-md p-3 mb-3 hover:shadow-sm transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg">{t.name}</div>
                      <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                        {t.content}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(t.content);
                          alert("Copied content to clipboard");
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-sm text-gray-500">
                  No templates yet.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
