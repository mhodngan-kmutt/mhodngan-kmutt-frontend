import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut, getSession, getUser, onAuthStateChange, verifyKmuttEmail } from '../../../lib/auth.ts';
import type { User } from '@supabase/supabase-js';
import GoogleIcon from '../../../assets/icons/googleIcon.tsx';
import { DropdownProfile } from '../dropdown/DropdownProfile.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';

interface AuthHeaderButtonProps {
  lang: string;
}

export default function AuthHeaderButton({ lang }: AuthHeaderButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Wait for Supabase session to be ready
        const sessionData = await getSession();
        const userData = sessionData?.user || (await getUser());

        if (userData) {
          const valid = await verifyKmuttEmail(lang);
          if (valid) {
            setUser(userData);
          } else {
            // Unauthorized, redirect handled in verifyKmuttEmail
            return;
          }
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', session);
      const currentUser = session?.user || null;
      if (currentUser) {
        const valid = await verifyKmuttEmail(lang);
        if (valid) setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [lang]);

  const handleLogin = async () => {
    try {
      console.log('🟢 Attempting Google sign-in...');
      await signInWithGoogle();
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Failed to sign in.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔴 Signing out user...');
      await signOut();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('Failed to sign out.');
    }
  };

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full bg-main-background" />;
  }

  if (user) {
    const fullName = user.user_metadata?.full_name || 'User';
    const firstName = fullName.split(' ')[0]; // take the first word
    const avatarUrl = user.user_metadata?.avatar_url || null;

    console.log('👤 Logged in user:', { firstName, avatarUrl });

    return <DropdownProfile onLogout={handleLogout} name={firstName} avatarUrl={avatarUrl} />;
  }

  return (
    <button className="btn-icon" type="button" aria-label="Sign in" onClick={handleLogin}>
      <GoogleIcon className="w-5 h-5" />
      <span className="small">Sign in</span>
    </button>
  );
}
