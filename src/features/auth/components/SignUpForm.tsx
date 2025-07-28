"use client";

import Button from "@/shared/components/Button";
import useAuth from "../hooks/useAuth";
import FormInput from "@/shared/components/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormValues, signUpSchema } from "../lib/validationSchema";
import SignInErrorContent from "./SignInErrorContent";
import Modal from "@/shared/components/Modal";
import useModal from "@/shared/hooks/useModal";

const SignUpForm = () => {
  const { signUp, loading, error, signUpSuccess } = useAuth();
  console.log(error);

  const modal = useModal(error != null);

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema), defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const onSubmit = async (data: SignUpFormValues) => {
    await signUp(data);
  };

  const handleCloseModal = () => {
    modal.close();
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>

      {signUpSuccess && (
        <div className="text-green-500 text-sm text-center">
          Email verifikasi telah dikirim! Silakan cek inbox Anda.
        </div>
      )}

      <Modal isOpen={modal.isOpen} title="Sign Up Failed" onClose={handleCloseModal}>
        <SignInErrorContent errorMessage={error} />
      </Modal>

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          label="Name"
          type="text"
          placeholder="Your full name"
          {...register("name")}
          errorMessage={errors.name?.message}
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          {...register("email")}
          errorMessage={errors.email?.message}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="at least 8 characters"
          {...register("password")}
          errorMessage={errors.password?.message}
        />

        <FormInput
          id="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="at least 8 characters"
          {...register("confirmPassword")}
          errorMessage={errors.confirmPassword?.message}
        />
      </div>

      <div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Memproses..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
