import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

// Define which routes are protected
const protectedRoutes = ['/en/admin', '/en/profile'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  // Skip auth check during build/prerendering
  if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    return next();
  }

  // Create Supabase server client
  const supabase = createSupabaseServerClient(cookies);

  // Get the session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Store session and supabase client in locals for use in pages
  locals.session = session;
  locals.supabase = supabase;

  // Check if the user is trying to access a protected route
  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

  if (isProtectedRoute) {
    // If there's no session, redirect to the unauthorized page
    if (!session) {
      return redirect('/en/unauthorized');
    }
  }

  // If the route is not protected or the user is authenticated, continue
  return next();
});