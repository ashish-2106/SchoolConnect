"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You are not authorized to access this portal.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Please log in using an approved account.
        </p>

        <div className="mt-6">
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white w-full"
          >
            Logout & Try Another Account
          </Button>
        </div>
      </div>
    </main>
  );
}
