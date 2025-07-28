import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../utils/supabase/middleware';

const middleware = async (req: NextRequest) => {
  try {
    const res = NextResponse.next();
    const supabase = await createClient(req);

    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    return res;
  } catch (error) {
    throw error;
  }


};
export const config = {
  matcher: ['/dashboard/:path*'],
};

export default middleware;
