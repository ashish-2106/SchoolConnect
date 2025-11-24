"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between bg-white border-b px-6 py-3">
      <h1 className="text-xl font-bold">School Announcements</h1>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">
          {session?.user?.name ?? "Guest"}
        </span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
