'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Users {
  name: string
  avatar: string
}

interface AvatarGroupProps {
  contributors: Users[]
  className?: string
}

export default function AvatarGroup({
  contributors,
  className = '',
}: AvatarGroupProps) {
  return (
    <div className="flex justify-center -space-x-5">
      {contributors.map((c, i) => (
        <Avatar key={i} className={`w-10 h-10 border border-main-white ${className}`}>
          <AvatarImage src={c.avatar} alt={c.name} />
          <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}
