import ResetPasswordForm from "../components/auth/ResetPassword";


export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Reset Password
      </h1>
      <ResetPasswordForm />
    </div>
  );
}