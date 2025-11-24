"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔹 Determine role & redirect properly
  const redirectByRole = async (email: string) => {
    try {
      const res = await fetch(`/api/users/role?email=${email}`);
      const data = await res.json();

      if (!res.ok) throw new Error("Role check failed");

      if (data.role === "TEACHER") {
        // 🔥 Save teacher email (needed for Absents page)
        localStorage.setItem("teacherEmail", email);
        router.push("/teacher/dashboard");
      } 
      else if (data.role === "ADMIN") {
        router.push("/admin/dashboard");
      } 
      else {
        router.push("/unauthorized");
      }
    } catch (err) {
      console.error("Role fetch failed:", err);
      router.push("/unauthorized");
    }
  };

  // 🔹 Login or Signup
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("✅ Account created successfully! You can now log in.");
        setIsSignup(false);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);

        // 🔥 Save teacher email immediately
        localStorage.setItem("teacherEmail", userCred.user.email!);

        await redirectByRole(userCred.user.email!);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📧 Password reset email sent!");
    } catch (err: any) {
      setError("Failed to send reset email.");
    }
  };

  // 🔹 Google Sign-In
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email) throw new Error("Missing email");

      // 🔥 Save teacher email immediately
      localStorage.setItem("teacherEmail", email);

      await redirectByRole(email);
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img
            src="/lbslogo.png"
            alt="School Logo"
            className="h-20 w-24 object-contain drop-shadow-md"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-blue-600">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg w-full pl-10 p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-300 rounded-lg w-full pl-10 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {message && <p className="text-green-600 text-center">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-blue-600">
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4 inline" />}
            {isSignup ? "Sign Up" : "Login"}
          </Button>
        </form>

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border"
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>

        {!isSignup && (
          <button
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:underline w-full text-center mt-2"
          >
            Forgot Password?
          </button>
        )}

        <div className="text-center text-gray-600 text-sm mt-4">
          {isSignup ? (
            <>Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-blue-600 font-medium hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>Don’t have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
