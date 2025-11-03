// AuthHeaderButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut, getSession, getUser, onAuthStateChange, verifyKmuttEmail } from '../../../lib/auth.ts';
import type { User } from '@supabase/supabase-js';
import GoogleIcon from '../../../assets/icons/googleIcon.tsx';
import { DropdownProfile } from '../dropdown/DropdownProfile.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import WriteHeaderButton from './WriteHeaderButton.tsx';
import PublishButton from './PublishButton.tsx';
import CancelButton from './CancelButton.tsx';

interface AuthHeaderButtonProps {
  lang: string;
  signinButtonText: string;
  componentsColor?: string;
  mode?: 'default' | 'write';
}

export default function AuthHeaderButton({ signinButtonText, lang, componentsColor = 'bg-main-neutral', mode = 'default' }: AuthHeaderButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // ... (Auth init logic)
      try {
        const sessionData = await getSession();
        const userData = sessionData?.user || (await getUser());

        if (userData) {
          const valid = await verifyKmuttEmail(userData, lang);
          if (valid) {
            setUser(userData);
          } else {
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

      setLoading(true);

      if (currentUser) {
        const valid = await verifyKmuttEmail(currentUser, lang);

        if (valid) setUser(currentUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // 💡 Cleanup Functions
    return () => {
      authListener?.subscription.unsubscribe();
      // window.removeEventListener('editorPropsReady', handleEditorPropsReady as EventListener);
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
    return <Skeleton className={`h-10 w-10 rounded-full ${componentsColor}`} />;
  }

  if (user) {
    const fullName = user.user_metadata?.full_name || 'User';
    const firstName = fullName.split(' ')[0];
    const avatarUrl = user.user_metadata?.avatar_url || null;

    console.log('👤 Logged in user:', { firstName, avatarUrl });

    return (
      <div className="flex items-center gap-4">
        {mode === 'write' ? (
          <>
            <CancelButton
              onCancel={() => console.log("Writing canceled")}
            />
            <PublishButton />
          </>
        ) : (
          <WriteHeaderButton lang={lang} />
        )}
        <DropdownProfile onLogout={handleLogout} name={firstName} avatarUrl={avatarUrl} />
      </div>
    );
  }

  return (
    <button className="btn-icon" type="button" aria-label="Sign in" onClick={handleLogin}>
      <GoogleIcon className="w-5 h-5" />
      <span className="small">{signinButtonText}</span>
    </button>
  );
}