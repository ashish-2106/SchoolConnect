"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Loader2,
  Send,
  Trash2,
  FileText,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Template = { id: string; name: string; content: string };

export default function ComposeMessagePage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [targetsType, setTargetsType] = useState<"student" | "class" | "broadcast">("class");
  const [targetId, setTargetId] = useState<string>("");

  const [method, setMethod] = useState<"SMS" | "EMAIL" | "WHATSAPP">("SMS");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    loadTemplates();
    loadClasses();
    loadStudents();
  }, []);

  async function loadTemplates() {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/messages/templates");
      if (!res.ok) throw new Error("fail");
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
      setLoadingTemplates(false);
    }
  }

  async function loadClasses() {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch {}
  }

  async function loadStudents() {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.map((s: any) => ({ id: s.id, name: s.name })));
      }
    } catch {}
  }

  function applyTemplate(tid: string) {
    const t = templates.find((x) => x.id === tid);
    if (t) setMessage(t.content);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.imageUrl) {
      setImageUrl(data.imageUrl);
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();

    if (!message.trim()) return alert("Message cannot be empty.");
    if (targetsType !== "broadcast" && !targetId)
      return alert("Please select a target.");

    setSending(true);

    try {
      const payload = {
        type: method,
        targets: targetsType === "broadcast" ? ["all"] : [targetId],
        message,
        imageUrl: method === "WHATSAPP" ? imageUrl : undefined,
      };

      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");
      alert("✅ Message sent successfully!");
      router.push("/admin/messages");
    } catch (err) {
      alert("❌ Failed to send message.");
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">

      {/* BACK BUTTON */}
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Send className="h-7 w-7 text-blue-600" /> Compose Message
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send SMS, Email, or WhatsApp notifications to students, classes, or everyone.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* LEFT FORM */}
        <Card className="border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSend} className="space-y-6">

              {/* METHOD */}
              <div>
                <Label>Send Method</Label>
                <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TARGET TYPE */}
              <div>
                <Label>Target</Label>

                <RadioGroup
                  value={targetsType}
                  onValueChange={(v: any) => setTargetsType(v)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="class" id="class" />
                    <Label htmlFor="class">Class</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="broadcast" id="broadcast" />
                    <Label htmlFor="broadcast">Broadcast</Label>
                  </div>
                </RadioGroup>

                {/* DROPDOWN */}
                {targetsType !== "broadcast" && (
                  <Select value={targetId} onValueChange={(v) => setTargetId(v)}>
                    <SelectTrigger className="mt-3">
                      <SelectValue
                        placeholder={
                          targetsType === "class" ? "Select Class" : "Select Student"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(targetsType === "class" ? classes : students).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* MESSAGE */}
              <div>
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-32 mt-1"
                  placeholder="Type your message here..."
                />
              </div>

              {/* WHATSAPP IMAGE UPLOAD */}
              {method === "WHATSAPP" && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Upload Image
                  </Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />

                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-52 rounded-md border mt-2"
                    />
                  )}
                </div>
              )}

              {/* OPTIONAL IMAGE URL */}
              {method === "WHATSAPP" && (
                <div>
                  <Label>Optional Image URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-2"
                  />

                  {imageUrl && (
                    <img
                      src={imageUrl}
                      className="max-h-48 rounded-md border mt-3"
                      alt="Preview"
                    />
                  )}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {sending ? "Sending..." : "Send Message"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMessage("");
                    setImageUrl("");
                  }}
                >
                  Clear
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* TEMPLATES PANEL */}
        <Card className="border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Templates
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingTemplates ? (
              <div className="text-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                No templates found.
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    )}
                  >
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-gray-600 text-sm mt-1">{t.content}</div>

                    <div className="flex gap-3 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-100"
                        onClick={() => applyTemplate(t.id)}
                      >
                        Use
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Delete this template?")) return;
                          await fetch(`/api/messages/templates/${t.id}`, {
                            method: "DELETE",
                          });
                          setTemplates((prev) =>
                            prev.filter((x) => x.id !== t.id)
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
