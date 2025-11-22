'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export interface Contributor {
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
  role: string;
}

export interface AvatarGroupProps {
  contributors: Contributor[];
  className?: string;
}

const PLACEHOLDER_COLORS = [
  "404040", "EF4444", "0369A1", "C2410C"
];

function getRandomColor(userId: string) {
  // optional: hash userId for consistent color per user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PLACEHOLDER_COLORS.length;
  return PLACEHOLDER_COLORS[index];
}

export default function AvatarGroup({
  contributors,
  className = '',
}: AvatarGroupProps) {
  return (
    <div className="flex justify-center -space-x-5">
      {contributors.map((c, i) => {
        const initial = c.fullname?.charAt(0).toUpperCase() || '?';
        const color = getRandomColor(c.userId);
        const placeholderUrl = `https://placehold.co/40x40/${color}/ffffff?text=${initial}`;

        return (
          <Avatar key={i} className={`w-10 h-10 border border-main-white ${className}`}>
            <AvatarImage src={c.profileImageUrl || placeholderUrl} alt={c.fullname} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        )
      })}
    </div>
  )
}
