"use client";

import Button from "@/shared/components/Button";
import FormInput from "@/shared/components/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordFormValues, ForgotPasswordSchema } from "../lib/validationSchema";
import useAuth from "../hooks/useAuth";

const ForgotPasswordForm = () => {
  const { register, formState: { errors }, handleSubmit } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  })
  const { forgotPassword, loading } = useAuth();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    forgotPassword(data)
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          id="email"
          type="email"
          label="Email"
          placeholder="Example@email.com"
          {...register("email")}
          errorMessage={errors.email?.message}
        />
      </div>

      <div className="text-sm text-center text-gray-600 mb-4">
        We'll send a password reset link to your email.
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
