import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';
import SocialLogin from '../components/auth/SocialLogin.';


export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Welcome" 
      subtitle={
        <>
          Today is a new day. Its your day. You shape it.<br />
          Sign up to start managing your projects.
        </>
      }
      showTwoColumns={true}
    >
      <RegisterForm />
      <SocialLogin />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}