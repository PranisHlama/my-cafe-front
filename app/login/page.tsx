"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const redirectByRole = (role?: UserRole | string | null) => {
    if (role === UserRole.OWNER || role === UserRole.MANAGER || role === "admin") {
      router.replace("/dashboard");
    } else if (role === UserRole.CASHIER || role === UserRole.BARISTA || role === UserRole.KITCHEN || role === "cashier") {
      router.replace("/pos");
    } else {
      router.replace("/menu");
    }
  };

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      const currentUser: any = AuthService.getCurrentUser();
      const role = currentUser?.role ?? currentUser?.user?.role ?? null;
      redirectByRole(role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = await AuthService.login({ username, password, rememberMe });
      const role = auth?.user?.role;
      redirectByRole(role);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-6 shadow rounded bg-white w-80"
      >
        <h2 className="text-xl font-bold mb-4">Sign In</h2>
        {error && <p className="text-red-500">{error}</p>}

        <label className="block mb-2">
          Username or Email
          <input
            type="text"
            className="border p-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="block mb-2">
          Password
          <input
            type="password"
            className="border p-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          Remember me
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
