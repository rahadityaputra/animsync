"use client";

import { useSearchParams } from "next/navigation";
import Button from "@/shared/components/Button";
import FormInput from "@/shared/components/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPassworsFormValues, ResetPassworsSchema } from "../lib/validationSchema";
import useAuth from "../hooks/useAuth";

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const { resetPassword, loading, error } = useAuth();
  const token = searchParams?.get("token"); // Ambil token dari URL
  const { register, formState: { errors: validationErrors }, handleSubmit } = useForm({
    resolver: zodResolver(ResetPassworsSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    }
  })

  if (!token) throw new Error("Token tidak valid");


  const onSubmit = async (data: ResetPassworsFormValues) => {
    resetPassword(data)
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          id="password"
          label="New Password"
          type="password"
          placeholder="Enter new password"
          {...register('newPassword')}
          errorMessage={validationErrors.newPassword?.message}
        />

        <FormInput
          id="confirmPassword"
          label="New Password Confirmation"
          type="password"
          placeholder="Enter confitrm new password"
          {...register('confirmNewPassword')}
          errorMessage={validationErrors.confirmNewPassword?.message}
        />
      </div>

      <div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Memproses..." : "Reset Password"}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
