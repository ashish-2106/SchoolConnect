"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  name: string;
  parentName?: string;
  parentEmail?: string;
  parentContact: string;
  className?: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔥 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show only 10 students per page

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(data);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    await fetchStudents();
  }

  // 🔍 SEARCH FILTER
  const filtered = students.filter((s) =>
    [s.name, s.parentName, s.parentContact]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 📌 PAGINATION CALCULATION
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground">
            View, search and manage students.
          </p>
        </div>

        <Link
          href="/admin/students/add"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-6 relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.65-4.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>

        <Input
          placeholder="Search by name, parent or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>


      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading students...
        </div>
      )}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div className="py-10 text-gray-500 text-center">No students found.</div>
      )}

      {/* DESKTOP TABLE */}
      {!loading && paginatedStudents.length > 0 && (
        <>
          <div className="hidden md:block border rounded-lg bg-white overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left px-3">Class</th>
                  <th className="text-left px-3">Parent Name</th>
                  <th className="text-left px-3">Parent Email</th>
                  <th className="text-left px-3">Parent Contact</th>
                  <th className="text-right px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{s.name}</td>
                    <td className="px-3">{s.className ?? "—"}</td>
                    <td className="px-3">{s.parentName ?? "—"}</td>
                    <td className="px-3">{s.parentEmail ?? "—"}</td>
                    <td className="px-3">{s.parentContact}</td>
                    <td className="px-3 text-right space-x-2">
                      <Link
                        href={`/admin/students/${s.id}/edit`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Link>

                      <button
                        onClick={() => onDelete(s.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4 mt-4">
            {paginatedStudents.map((s) => (
              <div key={s.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <p className="font-semibold text-lg">{s.name}</p>
                <p className="text-sm text-gray-600">Class: {s.className ?? "—"}</p>
                <p className="text-sm text-gray-600">Parent: {s.parentName ?? "—"}</p>
                <p className="text-sm text-gray-600">Email: {s.parentEmail ?? "—"}</p>
                <p className="text-sm text-gray-600">Contact: {s.parentContact}</p>

                <div className="flex justify-between mt-3">
                  <Link
                    href={`/admin/students/${s.id}/edit`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>

                  <button
                    onClick={() => onDelete(s.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex justify-center items-center gap-3 mt-6">
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
