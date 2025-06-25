'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FormInput from './FormInput.';
import Button from './Button.';

const ResetPasswordForm = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      // Validasi password
      if (password !== confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      if (password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }

      // Dapatkan access_token dari URL
      const token = searchParams.get('token');
      if (!token) throw new Error('Token tidak valid');

      // Reset password
      const { error: resetError } = await supabase.auth.updateUser({
        password,
      });

      if (resetError) throw resetError;

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes('invalid token')
            ? 'Link reset password tidak valid atau kadaluarsa'
            : err.message
          : 'Gagal reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-500 text-sm text-center mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-500 text-sm text-center mb-4">
          Password berhasil direset! Anda akan dialihkan ke halaman login.
        </div>
      )}

      <div className="rounded-md shadow-sm space-y-4">
        <FormInput
          id="password"
          name="password"
          label="Password Baru"
          type="password"
          placeholder="Minimal 8 karakter"
          required
          minLength={8}
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="Ketik ulang password"
          required
          minLength={8}
        />
      </div>

      <div>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Memproses...' : 'Reset Password'}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;