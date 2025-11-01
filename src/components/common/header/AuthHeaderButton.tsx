// AuthHeaderButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { signInWithGoogle, signOut, getSession, getUser, onAuthStateChange, verifyKmuttEmail } from '../../../lib/auth.ts';
import type { User } from '@supabase/supabase-js';
import GoogleIcon from '../../../assets/icons/googleIcon.tsx';
import { DropdownProfile } from '../dropdown/DropdownProfile.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import WriteHeaderButton from './WriteHeaderButton.tsx';
import PublishButton from './PublishButton.tsx'; // 💡 Import PublishButton
import type { BlockEditorRef } from '../BlockEditor'; // 💡 Import type-only

interface EditorPropsEvent extends CustomEvent {
  detail: {
    editorRef: React.RefObject<BlockEditorRef>;
    title: string;
  };
}

interface AuthHeaderButtonProps {
  lang: string;
  signinButtonText: string;
  componentsColor?: string;
  mode?: 'default' | 'write';
}

export default function AuthHeaderButton({ signinButtonText, lang, componentsColor = 'bg-main-neutral', mode = 'default' }: AuthHeaderButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [editorRefState, setEditorRefState] = useState<React.RefObject<BlockEditorRef> | undefined>(undefined);
  const [titleState, setTitleState] = useState<string | undefined>(undefined);

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

    const handleEditorPropsReady = (event: EditorPropsEvent) => {
      if (event.detail) {
        setEditorRefState(event.detail.editorRef);
        setTitleState(event.detail.title);
      }
    };

    // 💡 ฟัง Event เมื่อ Component Mount
    window.addEventListener('editorPropsReady', handleEditorPropsReady as EventListener);

    // 💡 Cleanup Functions
    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('editorPropsReady', handleEditorPropsReady as EventListener);
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
            <button className="btn-ghost-light">Cancel</button>
            
            {editorRefState && titleState !== undefined ? (
              <PublishButton editorRef={editorRefState} title={titleState} />
            ) : (
              <button className="btn-locked">Publish</button>
            )}
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