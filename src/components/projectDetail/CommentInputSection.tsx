import React, { useState, useEffect } from 'react';
import Avatar from '../common/Avatar/Avatar';
import { CommentInput } from '../ui/commentInput';
import { getSession } from '../../lib/auth';
import { sendComment } from '../../lib/api';

interface User {
  name: string;
  avatar: string;
  isAuthenticated: boolean;
}

interface CommentInputSectionProps {
  projectId: string;
}

export default function CommentInputSection({ projectId }: CommentInputSectionProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('userData');
      if (raw) {
        const userData = JSON.parse(raw);
        setUser({
          name: userData.fullname || userData.name || 'User',
          avatar: userData.profileImageUrl || userData.avatar || '',
          isAuthenticated: true,
        });
      } else {
        // Handle case where user is not logged in
        setUser({ name: 'Guest', avatar: '', isAuthenticated: false });
      }
    } catch (e) {
      console.error('Failed to parse user data from session storage', e);
      setUser({ name: 'Error', avatar: '', isAuthenticated: false });
    }
  }, []);

  // Render a loading state while checking for the user
  if (!user) {
    return (
      <div className="flex items-start px-4 py-3 gap-4 opacity-50">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex flex-col py-1 gap-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start px-4 py-3 gap-4">
      <Avatar name={user.name} avatar={user.avatar} />
      <div className="flex flex-col py-1 gap-3 flex-1">
        {user.isAuthenticated && (
          <span className="text-main-neutral2 small">{user.name}</span>
        )}
        <CommentInput
          // Disable input and change placeholder if not authenticated
          disabled={!user.isAuthenticated}
          placeholder={
            user.isAuthenticated
              ? "Share your thoughts about this project..."
              : "Please log in to comment na ja."
          }
          onSubmit={async (comment) => {
            const session = await getSession();
            const token = session?.access_token;

            if (!token) {
              alert('Authentication error. Please log in again to comment.');
              return;
            }

            try {
              await sendComment({
                projectId: projectId,
                message: comment,
                token: token,
              });
              // Reload the page to see the new comment
              window.location.reload();
            } catch (error) {
              console.error('Failed to post comment:', error);
            }
          }}
        />
      </div>
    </div>
  );
}