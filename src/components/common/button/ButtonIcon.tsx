'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ButtonIconProps {
  text: string
  icon: React.ElementType
  link: string
}

export default function ButtonIcon({ text, icon: Icon, link }: ButtonIconProps) {
  return (
    <a href={link}>
      <Button variant="outline" aria-label={text} className='btn-icon'>
        <Icon />
        <span className="small ml-1">{text}</span>
      </Button>
    </a>
  )
}
