import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_code`);
  }

  const supabase = createClient();

  try {
    // 1. Tukar code untuk session
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
    if (authError) throw authError;

    // 2. Update status verifikasi
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('users')
        .update({ email_confirmed_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    return NextResponse.redirect(requestUrl.origin);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=authentication_failed`
    );
  }
}