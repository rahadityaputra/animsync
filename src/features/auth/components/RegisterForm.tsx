"use client";

import Button from "@/shared/components/Button";
import useAuth from "../hooks/useAuth";
import FormInput from "@/shared/components/FormInput";

const RegisterForm = () => {
  const { signUp, loading, error, registerSuccess } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    signUp(formData);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {registerSuccess && (
        <div className="text-green-500 text-sm text-center">
          Email verifikasi telah dikirim! Silakan cek inbox Anda.
        </div>
      )}

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          id="name"
          name="name"
          label="Name"
          type="text"
          placeholder="Your full name"
          required
        />

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

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="at least 8 characters"
          required
          minLength={8}
        />
      </div>

      {/* Tombol Submit */}
      <div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Memproses..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
