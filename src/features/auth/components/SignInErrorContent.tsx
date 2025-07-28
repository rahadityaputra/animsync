import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface SignInErrorContentProps {
  errorMessage: string | null;
}

const SignInErrorContent: React.FC<SignInErrorContentProps> = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <div className="text-center p-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">Sign In Failed</h3>
      <div className="mt-2 text-sm text-gray-500">
        <p>{errorMessage}</p>
        <p className="mt-2">Please check your credentials and try again.</p>
      </div>
    </div>
  );
};


export default SignInErrorContent;
