"use client";

import Link from "next/link";
import Button from "@/shared/components/Button";
import useAuth from "../hooks/useAuth";
import FormInput from "@/shared/components/FormInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { SignInFormValues, signInSchema } from "../lib/validationSchema";

const SignInForm = () => {
  const { signIn, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema), defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  const onSubmit: SubmitHandler<SignInFormValues> = (data: SignInFormValues) => {
    signIn(data);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          {...register("email")}
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          required
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}

        <FormInput
          {...register("password")}
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="at least 8 characters"
          required
          minLength={8}
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register("rememberMe")}
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

export default SignInForm;
