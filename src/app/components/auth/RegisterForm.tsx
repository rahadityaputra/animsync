// RegisterForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Pastikan path ini benar
import Button from "./Button.";
import FormInput from "./FormInput.";



const RegisterForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validasi Sisi Klien: Password tidak cocok
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      // 1. Cek email sudah terdaftar di tabel 'users' kustom Anda
      // *** PERUBAHAN KRUSIAL: Menggunakan .maybeSingle() untuk menangani kasus 'no rows found' ***
      const { data: existingUser, error: checkUserError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle(); // <--- INI PERUBAHANNYA

      // .maybeSingle() tidak akan error jika tidak ada baris, jadi checkUserError hanya jika ada masalah lain
      if (checkUserError) { 
        console.error("Error checking existing user (maybeSingle):", checkUserError);
        throw new Error(checkUserError.message || "Gagal memeriksa email.");
      }

      if (existingUser) { // Jika existingUser TIDAK null, berarti email sudah ada
        throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau login.");
      }

      // 2. Registrasi di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }, // Menyimpan nama lengkap sebagai metadata user Auth
          emailRedirectTo: `${window.location.origin}/auth/callback`, // URL redirect setelah verifikasi email
        },
      });

      if (authError) {
        // Log error dari Supabase Auth secara detail
        console.error("Supabase Auth SignUp Error (Full Object):", authError);
        // Terkadang pesan error dari Supabase bisa jadi 'User already registered'
        if (authError.message.includes("already registered")) {
          throw new Error("Email sudah terdaftar di sistem otentikasi.");
        }
        // Pastikan melempar error agar ditangkap di blok catch utama
        throw authError;
      }

      // 3. Verifikasi apakah email perlu dikonfirmasi (default Supabase)
      const requiresEmailConfirmation = authData.user?.identities?.some(
        (identity) =>
          identity.identity_data?.email === email &&
          !identity.identity_data?.email_verified
      );

      // 4. Simpan data user ke tabel 'users' kustom Anda
      if (authData.user) {
        const { error: dbError } = await supabase.from("users").insert({
          id: authData.user.id, // ID dari Supabase Auth
          email: authData.user.email,
          username: name.toLowerCase().replace(/\s+/g, "_"), // Buat username dari nama
          full_name: name,
          created_at: new Date().toISOString(),
          // Atur email_confirmed_at berdasarkan status verifikasi
          email_confirmed_at: requiresEmailConfirmation
            ? null // Belum dikonfirmasi
            : new Date().toISOString(), // Langsung dikonfirmasi
          last_sign_in_at: null, // *** Asumsi ini NOT NULL di DB Anda ***
        });

        if (dbError) {
          // LOG DETAIL ERROR DARI DATABASE DI SINI
          console.error("Supabase DB Insert Error (Full Object):", dbError);
          // Tambahkan penanganan untuk error unique constraint jika ada
          if (dbError.code === '23505') { // PostgreSQL unique violation error code
            throw new Error("Username atau email sudah digunakan (konflik database).");
          }
          // Pastikan melempar error agar ditangkap di blok catch utama
          throw dbError; 
        }
      }

      // 5. Handle redirect berdasarkan konfirmasi email
      if (requiresEmailConfirmation) {
        setSuccess(true); // Tampilkan pesan sukses verifikasi
        setTimeout(() => router.push("/verify-email"), 1500); // Arahkan ke halaman verifikasi
      } else {
        // Langsung login jika tidak perlu verifikasi email
        // Ini jarang terjadi kecuali Anda mematikan "Confirm email" di pengaturan Supabase Auth
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Supabase SignIn After Register Error (Full Object):", signInError);
          setError("Registrasi berhasil, tapi gagal otomatis masuk. Silakan coba login.");
        } else {
          router.push("/dashboard"); // Arahkan ke dashboard jika berhasil masuk
        }
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // Menggunakan 'any' untuk err agar lebih fleksibel dalam logging
      // Ini adalah bagian kunci untuk debugging
      console.error("Final Registration Error (Full Object):", err); // Log objek error lengkap
      
      let errorMessage = "Registrasi gagal. Silakan coba lagi."; // Default error message

      // Coba ekstrak pesan error dari objek 'err'
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err; // Jika error adalah string sederhana
      }

      // Penanganan pesan spesifik dari Supabase Auth atau DB
      if (errorMessage.includes("already registered") || errorMessage.includes("Email sudah terdaftar")) {
        errorMessage = "Email sudah terdaftar. Silakan gunakan email lain.";
      } else if (errorMessage.includes("Password should be at least 6 characters")) {
        errorMessage = "Password minimal harus 6 karakter.";
      } else if (errorMessage.includes("duplicate key value") || errorMessage.includes("Username atau email sudah digunakan")) {
        errorMessage = "Email atau Username sudah terdaftar.";
      } else if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (errorMessage.includes("Network Error")) {
        errorMessage = "Terjadi masalah jaringan. Silakan coba lagi.";
      }
      // Anda bisa menambahkan lebih banyak kondisi 'includes' di sini sesuai error yang Anda temui

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {/* Area pesan error/sukses */}
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {success && (
        <div className="text-green-500 text-sm text-center">
          Email verifikasi telah dikirim! Silakan cek inbox Anda.
        </div>
      )}

      {/* Input Formulir */}
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