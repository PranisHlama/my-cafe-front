"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = await AuthService.login({ username, password, rememberMe });
      const role = auth?.user?.role;

      // Role-based redirect
      if (role === UserRole.OWNER || role === UserRole.MANAGER) {
        router.push("/dashboard");
      } else if (role === UserRole.CASHIER) {
        router.push("/pos");
      } else if (role === UserRole.BARISTA || role === UserRole.KITCHEN) {
        router.push("/pos");
      } else {
        router.push("/menu");
      }
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
