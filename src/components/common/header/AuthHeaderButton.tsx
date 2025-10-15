import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut, getUser, onAuthStateChange } from '../../../lib/auth.ts';
import type { User } from '@supabase/supabase-js';
import ButtonIcon from '../button/ButtonIcon.tsx';
import GoogleIcon from '../../../assets/icons/googleIcon.tsx';
import { DropdownProfile } from '../dropdown/DropdownProfile.tsx';

export default function AuthHeaderButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser()
      .then((userData) => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const { data: authListener } = onAuthStateChange((_event, session) => {
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
      alert('Failed to sign in.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);

      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out.');
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading...</p>;
  }

  if (user) {
    const name = user.user_metadata?.full_name || 'User';
    const email = user.email || '';
    return <DropdownProfile onLogout={handleLogout} />;
  }

  return (
    <button onClick={handleLogin}>
      <ButtonIcon text="Sign in" icon={GoogleIcon} />
    </button>
  );
}
