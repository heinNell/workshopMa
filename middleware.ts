import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/api/health'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function createSupabaseServerClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
          res.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip checks for public routes and static assets
  const isAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(.*)$/);

  if (isAsset || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for existing session cookie before calling Supabase
  const sessionToken = req.cookies.get('sb-qxaboxoqkdhmgcbdttir-auth-token');
  
  if (!sessionToken) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const res = NextResponse.next();
  const supabase = createSupabaseServerClient(req, res);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};