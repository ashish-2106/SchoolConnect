"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeacherForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-3"
    >
      <Input name="name" placeholder="Teacher Name" onChange={handleChange} />
      <Input name="email" placeholder="Email" onChange={handleChange} />
      <Input name="subject" placeholder="Subject" onChange={handleChange} />
      <Button type="submit" className="w-full">
        Save Teacher
      </Button>
    </form>
  );
}
