import { NextRequest, NextResponse } from 'next/server'
import { createClient } from './features/auth/lib/supabase/server';

const middleware = async (req: NextRequest) => {
  const res = NextResponse.next()
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

export default middleware;
