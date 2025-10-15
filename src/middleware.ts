
import { defineMiddleware } from 'astro:middleware';

// Define which routes are protected
const protectedRoutes = ['/en/admin', '/en/profile'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Check if the user is trying to access a protected route
  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for a session cookie (or any other auth token)
    const session = cookies.get('session');

    // If there's no session cookie, redirect to the 401 page
    if (!session) {
      return redirect('/en/unauthorized');
    }

    // Here you could also add logic to verify the session token is valid
  }

  // If the route is not protected or the user is authenticated, continue
  return next();
});