'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Contributor {
  name: string
  avatar: string
}

interface ContributorAvatarsProps {
  contributors: Contributor[]
  className?: string
}

export default function ContributorAvatars({
  contributors,
  className = '',
}: ContributorAvatarsProps) {
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
