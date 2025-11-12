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
export default function AvatarGroup({
  contributors,
  className = '',
}: AvatarGroupProps) {
  return (
    <div className="flex justify-center -space-x-5">
      {contributors.map((c, i) => (
        <Avatar key={i} className={`w-10 h-10 border border-main-white ${className}`}>
          <AvatarImage src={c.profileImageUrl} alt={c.username} />
          <AvatarFallback>{c.username?.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}
