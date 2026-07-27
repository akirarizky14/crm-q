import type { HTMLAttributes } from 'react'
import './ui.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'dark' | 'accent'
}

export function Card({ variant = 'surface', className = '', ...props }: CardProps) {
  return <div className={`card card-${variant} ${className}`} {...props} />
}
