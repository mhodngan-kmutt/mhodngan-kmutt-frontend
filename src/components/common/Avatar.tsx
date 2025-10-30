'use client'

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface AvatarProps {
  name: string
  avatar: string
  className?: string
}

export default function AvatarComponent({
  name,
  avatar,
  className = '',
}: AvatarProps) {
  return (
    <Avatar className={`w-10 h-10 border border-main-white ${className}`}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

{/* <AvatarComponent 
  name="John Doe"
  avatar="/path/to/avatar.png"
  className="w-12 h-12"  // optional custom size
/> */}