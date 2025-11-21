'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

<<<<<<< HEAD
interface Contributor {
=======
export interface Contributor {
>>>>>>> 15cc28596eafd404af0b0b7247895ea35f32b13c
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
  role: string;
}

<<<<<<< HEAD
interface AvatarGroupProps {
  contributors: Contributor[] | string;
  className?: string;
=======
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
>>>>>>> 15cc28596eafd404af0b0b7247895ea35f32b13c
}

export default function AvatarGroup({
  contributors,
  className = '',
}: AvatarGroupProps) {
  // Parse contributors if it's a JSON string
  let parsedContributors: Contributor[] = [];
  
  try {
    if (typeof contributors === 'string') {
      // It's a JSON string, parse it
      parsedContributors = JSON.parse(contributors);
    } else if (Array.isArray(contributors)) {
      // It's already an array
      parsedContributors = contributors;
    }
  } catch (error) {
    console.error('Failed to parse contributors JSON:', error);
    return (
      <div className="flex justify-center">
        <span className="text-red-500 text-sm">Invalid contributors data</span>
      </div>
    );
  }

  // Check if we have valid contributors
  if (!Array.isArray(parsedContributors) || parsedContributors.length === 0) {
    return (
      <div className="flex justify-center">
        <span className="text-gray-500 detail">-</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center -space-x-5">
<<<<<<< HEAD
      {parsedContributors.map((contributor: Contributor) => (
        <Avatar 
          key={contributor.userId}
          className={`w-10 h-10 border border-main-white ${className}`}
          title={`${contributor.fullname} (${contributor.email})`}
        >
          <AvatarImage 
            src={contributor.profileImageUrl} 
            alt={contributor.fullname} 
          />
          <AvatarFallback>
            {(contributor.fullname || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
=======
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
>>>>>>> 15cc28596eafd404af0b0b7247895ea35f32b13c
    </div>
  )
}