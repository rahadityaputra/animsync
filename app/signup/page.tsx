import { AuthLayout, SignUpForm, SocialLogin } from '@/features/auth';
import Link from 'next/link';

const SignUpPage = () => {
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
      <SignUpForm />
      <SocialLogin />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignUpPage;
