"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ForgotPasswordFormValues, ResetPassworsFormValues, SignInFormValues, SignUpFormValues } from "../lib/validationSchema";
import createClient from "../../../../utils/supabase/client";

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const signIn = async (signInData: SignInFormValues) => {
    try {
      setLoading(true);
      setError(null);
      const { email, password, rememberMe } = signInData;
      console.log(rememberMe);

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) throw authError;
      console.log("session", data.session);

      if (rememberMe && data.session) {
        const { error: cookieError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        console.log(cookieError);
        if (cookieError) throw cookieError;
      }



      if (data.user) {
        await supabase
          .from("users")
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }

      router.push("/dashboard");
      router.refresh();

    } catch (err) {
      let errorMessage = "Login failed. Please try again !.";
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Incorrect email or password.";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "Email not confirmed. Please check your inbox.";
        } else if (err.message.includes("Too many requests")) {
          errorMessage = "Too many attempts. Please wait a moment.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (signUpData: SignUpFormValues) => {
    const { name, email, password } = signUpData;

    try {
      setLoading(true);
      setError(null);

      const { data: existingUser, error: checkUserError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (checkUserError) {
        console.error("Error checking existing user (maybeSingle):", checkUserError);
        throw new Error(checkUserError.message || "Failed to check email availability.");
      }

      if (existingUser) {
        throw new Error("Email is already registered. Please use a different email or sign in.");
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error("Supabase Auth SignUp Error (Full Object):", authError);
        if (authError.message.includes("already registered")) {
          throw new Error("Email is already registered in the authentication system.");
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
          id: authData.user.id,
          email: authData.user.email,
          username: name.toLowerCase().replace(/\s+/g, "_"), // Ensures username is lowercase and uses underscores
          full_name: name,
          created_at: new Date().toISOString(),
          email_confirmed_at: requiresEmailConfirmation
            ? null
            : new Date().toISOString(),
          last_sign_in_at: null,
        });

        if (dbError) {
          console.error("Supabase DB Insert Error (Full Object):", dbError);

          // Check for specific database unique constraint error code (e.g., username/email conflict)
          if (dbError.code === '23505') {
            throw new Error("Username or email is already in use (database conflict).");
          }
          throw dbError; // Re-throw other database errors
        }
      }

      // --- Handle post-signup actions (email confirmation or auto sign-in) ---
      if (requiresEmailConfirmation) {
        setSignUpSuccess(true); // Assuming you have this state
        setTimeout(() => router.push("/verify-email"), 1500); // Redirect to email verification page
      } else {
        // If no email confirmation is needed, try to sign the user in automatically
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error("Supabase SignIn After Register Error (Full Object):", signInError);
          setError("Registration successful, but failed to automatically sign in. Please try to sign in manually.");
        } else {
          router.push("/dashboard"); // Redirect to dashboard on successful auto sign-in
        }
      }

    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";

      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      if (errorMessage.includes("already registered") || errorMessage.includes("Email is already registered")) {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (errorMessage.includes("Password should be at least 6 characters")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (errorMessage.includes("duplicate key value") || errorMessage.includes("Username or email is already in use")) {
        errorMessage = "Email or username is already taken.";
      } else if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Could not connect to the server. Please check your internet connection.";
      } else if (errorMessage.includes("Network Error")) {
        errorMessage = "A network error occurred. Please try again.";
      }
      setError(errorMessage); // Set the user-facing error message
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('signin');
  }

  const forgotPassword = async (data: ForgotPasswordFormValues) => {
    const { email } = data;
    try {
      setLoading(true);
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?token=TOKEN&type=recovery`,
      });

      if (error) {
        throw new Error(
          error.message.includes("user not found")
            ? "Email is not registered"
            : error.message
        );
      }
    } catch (error: any) {
      setError(error.message)

    } finally {
      setLoading(false)
    }

  }

  const resetPassword = async (data: ResetPassworsFormValues) => {
    const { newPassword } = data;
    try {
      setLoading(true);
      setError(null)

      const { error: resetError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (resetError) throw resetError;

      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes("invalid token")
            ? "Link reset password tidak valid atau kadaluarsa"
            : err.message
          : "Gagal reset password"
      );
    } finally {
      setLoading(false);
    }

  }
  return { loading, error, signIn, signUp, signOut, signUpSuccess, forgotPassword, resetPassword }
}
export default useAuth;
