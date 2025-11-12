'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Contributor {
  userId: string;
  username: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
  role: string;
}

interface AvatarGroupProps {
  contributors: Contributor[] | string;
  className?: string;
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
    </div>
  )
}