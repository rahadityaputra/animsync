'use client';

import { useState } from 'react';
import createClient from '../../utils/supabase/client';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setMessage('Email verifikasi telah dikirim ulang!');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal mengirim ulang email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Verifikasi Email</h1>
      <p className="mb-4">Silakan cek email Anda untuk link verifikasi</p>

      <div className="mb-4">
        <label className="block mb-2">Email Anda:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="user@example.com"
        />
      </div>

      <button
        onClick={handleResend}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? 'Mengirim...' : 'Kirim Ulang Email'}
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
