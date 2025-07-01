"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FormInput from "./FormInput.";
import Link from "next/link";
import Button from "./Button.";

const LoginForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const rememberMe = formData.get("remember-me") === "on";

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) throw authError;

      if (rememberMe && data.session) {
        const { error: cookieError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (cookieError) throw cookieError;
      }

      // 3. Update last_sign_in_at (opsional)
      if (data.user) {
        await supabase
          .from("users")
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 100);
    } catch (err) {
      let errorMessage = "Login gagal. Silakan coba lagi.";

      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Email atau password salah.";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "Email belum dikonfirmasi. Cek inbox Anda.";
        } else if (err.message.includes("Too many requests")) {
          errorMessage = "Terlalu banyak percobaan. Tunggu beberapa saat.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          required
        />

        <FormInput
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="at least 8 characters"
          required
          minLength={8}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Memproses..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
