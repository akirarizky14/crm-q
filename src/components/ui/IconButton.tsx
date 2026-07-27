import type { ButtonHTMLAttributes } from 'react'
import './ui.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'light' | 'dark'
}

export function IconButton({ tone = 'light', className = '', children, ...props }: IconButtonProps) {
  return (
    <button className={`icon-btn icon-btn-${tone} ${className}`} type="button" {...props}>
      {children}
    </button>
  )
}
