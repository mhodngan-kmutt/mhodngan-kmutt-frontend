import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';
import { getCurrentUser } from './lib/api';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;

  // Skip checks during build or missing env
  const missingEnv =
    !import.meta.env.PUBLIC_SUPABASE_URL ||
    !import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (missingEnv) return next();

  // Create Supabase server client
  const supabase = createSupabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();

  // Expose to the rest of the app
  locals.session = session;
  locals.supabase = supabase;

  /**
   * --------------------------------------------------------------------
   * 🔐 Route Guard: /project/me  (contributors only)
   * --------------------------------------------------------------------
   */
  if (url.pathname.endsWith('/project/me')) {
    if (!session) {
      return redirect('/en/404', 302);
    }

    try {
      const user = await getCurrentUser(session.access_token);

      if (user.role !== 'contributor') {
        return redirect('/en/404', 302);
      }
    } catch {
      return redirect('/en/404', 302);
    }
  }

  return next();
});
