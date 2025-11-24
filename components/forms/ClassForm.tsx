"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ClassForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", teacher: "" });

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
      <Input name="name" placeholder="Class Name" onChange={handleChange} />
      <Input name="teacher" placeholder="Assigned Teacher" onChange={handleChange} />
      <Button type="submit" className="w-full">
        Save Class
      </Button>
    </form>
  );
}
