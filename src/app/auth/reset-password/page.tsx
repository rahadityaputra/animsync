import ResetPasswordForm from '@/app/components/auth/ResetPassword';
import { Suspense } from 'react';


export default function Page() {
  return (
    <div className="max-w-md mx-auto p-6">
      <Suspense fallback={<div>Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}