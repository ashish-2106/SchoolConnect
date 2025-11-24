"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectItem, SelectContent } from "@/components/ui/select";

export function MessageForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("SMS");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your announcement message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Select value={mode} onValueChange={setMode}>
        <SelectTrigger>Select Sending Mode</SelectTrigger>
        <SelectContent>
          <SelectItem value="SMS">SMS</SelectItem>
          <SelectItem value="Email">Email</SelectItem>
          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
}
