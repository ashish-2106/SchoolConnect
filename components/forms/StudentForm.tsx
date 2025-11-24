"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StudentForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    name: "",
    className: "",
    parentEmail: "",
  });

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
      <Input name="name" placeholder="Student Name" onChange={handleChange} />
      <Input name="className" placeholder="Class" onChange={handleChange} />
      <Input
        name="parentEmail"
        placeholder="Parent Email"
        onChange={handleChange}
      />
      <Button type="submit" className="w-full">
        Save Student
      </Button>
    </form>
  );
}
