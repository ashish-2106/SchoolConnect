"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarLink {
  href: string;
  label: string;
  role?: "admin" | "teacher";
}

const links: SidebarLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", role: "admin" },
  { href: "/admin/teachers", label: "Teachers", role: "admin" },
  { href: "/admin/classes", label: "Classes", role: "admin" },
  { href: "/admin/students", label: "Students", role: "admin" },
  { href: "/admin/messages", label: "Announcements", role: "admin" },
  { href: "/teacher/dashboard", label: "Dashboard", role: "teacher" },
  { href: "/teacher/attendance", label: "Attendance", role: "teacher" },
  { href: "/teacher/classes", label: "My Classes", role: "teacher" },
];

export function Sidebar({ role }: { role: "admin" | "teacher" }) {
  const pathname = usePathname();
  const filtered = links.filter((l) => l.role === role);

  return (
    <aside className="w-64 bg-gray-100 border-r p-4 flex flex-col space-y-2">
      <h2 className="text-lg font-semibold mb-2">
        {role === "admin" ? "Admin Portal" : "Teacher Portal"}
      </h2>

      {filtered.map((link) => (
        <Link key={link.href} href={link.href}>
          <Button
            variant={pathname === link.href ? "default" : "ghost"}
            className={cn("w-full justify-start")}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </aside>
  );
}
