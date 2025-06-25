"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FormInput from "./FormInput.";
import Button from "./Button.";

const ForgotPasswordForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Format email tidak valid");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?token=TOKEN&type=recovery`,
      });

      if (error) {
        throw new Error(
          error.message.includes("user not found")
            ? "Email tidak terdaftar"
            : error.message
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes("rate limit")
            ? "Terlalu banyak permintaan. Silakan coba lagi nanti."
            : err.message
          : "Gagal mengirim email reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-500 text-sm text-center mb-4">{error}</div>
      )}
      {success && (
        <div className="text-green-500 text-sm text-center mb-4">
          Email reset password telah dikirim! Silakan cek inbox/spam folder
          Anda.
        </div>
      )}

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          required
        />
      </div>

      <div className="text-sm text-center text-gray-600 mb-4">
        Kami akan mengirim tautan untuk mereset password ke email Anda
      </div>

      <div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
