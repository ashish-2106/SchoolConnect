"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTeachers(data);
    } catch {
      // fallback dummy data
      setTeachers([
        { id: "t1", name: "Alice Johnson", email: "alice@school.edu", phone: "9999999999" },
        { id: "t2", name: "Bob Kumar", email: "bob@school.edu", phone: "8888888888" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this teacher?")) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    await fetchTeachers();
  }

  // Filter by search text
  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return teachers;

    return teachers.filter((t) => {
      const s = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        (t.phone ?? "").toLowerCase().includes(s)
      );
    });
  }, [search, teachers]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 on new search
  useEffect(() => setCurrentPage(1), [search]);

  return (
    <div className="w-full">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground">
            View and manage teacher information.
          </p>
        </div>

        <Link
          href="/admin/teachers/add"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Add Teacher
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading teachers...
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredTeachers.length === 0 && (
        <div className="py-10 text-gray-500 text-center">
          No matching teachers found.
        </div>
      )}

      {/* TABLE */}
      {!loading && paginatedTeachers.length > 0 && (
        <>
          <div className="hidden md:block border rounded-lg bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedTeachers.map((t) => (
                  <TableRow key={t.id} className="hover:bg-gray-50">
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.phone || "—"}</TableCell>
                    <TableCell className="text-right space-x-2">

                      <Link
                        href={`/admin/teachers/${t.id}/edit`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Link>

                      <button
                        onClick={() => onDelete(t.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4 mt-4">
            {paginatedTeachers.map((t) => (
              <div
                key={t.id}
                className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
              >
                <div>
                  <p className="font-semibold text-lg">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.email}</p>
                  <p className="text-sm text-gray-500">{t.phone || "—"}</p>
                </div>

                <div className="flex justify-between pt-2">
                  <Link
                    href={`/admin/teachers/${t.id}/edit`}
                    className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>

                  <button
                    onClick={() => onDelete(t.id)}
                    className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex justify-center items-center gap-3 mt-6">
            {/* Previous */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
