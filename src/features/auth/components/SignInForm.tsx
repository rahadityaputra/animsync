"use client";

import Link from "next/link";
import Button from "@/shared/components/Button";
import useAuth from "../hooks/useAuth";
import FormInput from "@/shared/components/FormInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/components/Modal";
import { useEffect, useState } from "react";
import SignInErrorContent from "./SignInErrorContent";
import { SignInFormValues } from "../lib/validationSchema";
import { signInSchema } from "../lib/validationSchema";

const SignInForm = () => {
  const { signIn, loading, error } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  useEffect(() => {
    setIsModalOpen(error ? true : false)
  }, [error])

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    await signIn(data);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>

      <Modal isOpen={isModalOpen} title="Sign In Failed" onClose={handleCloseModal}>
        <SignInErrorContent errorMessage={error} />
      </Modal>

      <div className="rounded-md shadow-sm space-y-4 p-4">
        <FormInput
          {...register("email")}
          id="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          errorMessage={errors.email?.message}
        />


        <FormInput
          {...register("password")}
          id="password"
          label="Password"
          type="password"
          placeholder="at least 8 characters"
          errorMessage={errors.password?.message}
        />

      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FormInput
            {...register("rememberMe")}
            label="Remember me"
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
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
