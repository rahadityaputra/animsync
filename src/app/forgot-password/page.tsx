import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';


export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle={
        <>
          Today is a new day. Its your day. You shape it.<br />
          Sign in to start managing your projects.
        </>
      }
      showTwoColumns={true}
    >
      <ForgotPasswordForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}