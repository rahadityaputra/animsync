"use client"

import { useRouter } from "next/navigation";
import createClient from "../lib/supabase/client";
import { useState } from "react";
import { SignInFormValues } from "../lib/validationSchema";

const useAuth = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const router = useRouter();
  // from client
  const supabase = createClient();

  const signIn = async (data: SignInFormValues) => {
    try {
      const email = data.get("email") as string;
      const password = data.get("password") as string;
      const rememberMe = data.get("remember-me") === "on";

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


      console.log(data);

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
      let errorMessage = "Login failed. Please try again !.";

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
  }


  const signUp = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      const { data: existingUser, error: checkUserError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle(); // <--- INI PERUBAHANNYA

      if (checkUserError) {
        console.error("Error checking existing user (maybeSingle):", checkUserError);
        throw new Error(checkUserError.message || "Gagal memeriksa email.");
      }

      if (existingUser) { // Jika existingUser TIDAK null, berarti email sudah ada
        throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau login.");
      }

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
        throw authError;
      }

      const requiresEmailConfirmation = authData.user?.identities?.some(
        (identity) =>
          identity.identity_data?.email === email &&
          !identity.identity_data?.email_verified
      );

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
        setRegisterSuccess(true); // Tampilkan pesan sukses verifikasi
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

    } catch (err: any) { // Menggunakan 'any' untuk err agar lebih fleksibel dalam logging

      let errorMessage = "Registrasi gagal. Silakan coba lagi."; // Default error message

      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err; // Jika error adalah string sederhana
      }

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

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('signin');
  }

  return { loading, error, signIn, signUp, signOut, registerSuccess }
}
export default useAuth;
