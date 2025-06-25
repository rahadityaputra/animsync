'use client';

import Link from 'next/link';
import FormInput from './FormInput.';
import Button from './Button.';


const LoginForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <FormInput 
          id="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          required
        />
        
        <FormInput 
          id="password"
          label="Password"
          type="password"
          placeholder="at least 8 characters"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot Password?
          </Link>
        </div>
      </div>

      <div>
        <Button type="submit" fullWidth>
          Sign in
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
