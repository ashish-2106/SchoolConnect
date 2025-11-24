"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  MessageSquare,
  LogOut,
  Menu,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Navigation Items
 */
const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Teachers", href: "/admin/teachers", icon: GraduationCap },
  { name: "Classes", href: "/admin/classes", icon: School },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Today's Absentees", href: "/admin/absents", icon: UserX },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-sm">

      {/* Mobile overlay */}
      <div
        aria-hidden={!sidebarOpen}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ------------------ SIDEBAR ------------------ */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0" // Always visible on desktop
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b py-6 px-6 flex flex-col items-center bg-white">
            <img
              src="/lbslogo.png"
              alt="School Logo"
              className="h-20 w-auto object-contain mb-2"
            />
            <h2 className="text-xl font-bold">School Admin</h2>
            <p className="text-xs text-muted-foreground">Manage your school easily</p>
          </div>

          {/* Nav list */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={cn(
                        "group flex items-center gap-4 w-full rounded-lg px-4 py-3 transition",
                        "hover:bg-primary/10 hover:text-primary",
                        active ? "bg-primary text-white shadow" : "text-muted-foreground"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-white" : "text-primary")} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer logout */}
          <div className="border-t p-4">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-3 text-base py-3 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {/* ------------------ MAIN CONTENT ------------------ */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center border-b px-4 py-3 bg-card shadow-sm">
          <div className="flex items-center">
            {/* Mobile hamburger */}
            <button
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((s) => !s)}
              className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="ml-4 text-xl font-semibold">Admin Dashboard</h1>
          </div>

          <div className="ml-auto flex items-center gap-3"></div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
