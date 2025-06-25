// login/page.tsx
import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm.';
import SocialLogin from '../components/auth/SocialLogin.';


export default function LoginPage() {
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
      <LoginForm />
      <SocialLogin />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Dont you have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}