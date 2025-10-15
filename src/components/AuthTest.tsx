import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut, getUser, onAuthStateChange } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

export default function AuthTest() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    getUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen to auth changes
    const { data: authListener } = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in. Check console for details.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out. Check console for details.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-4">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : user ? (
          <div className="flex items-center gap-3">
            <img
              src={user.user_metadata?.avatar_url || ''}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Not signed in</p>
        )}
      </div>

      <div className="space-x-4">
        {!user ? (
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Sign in with Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
