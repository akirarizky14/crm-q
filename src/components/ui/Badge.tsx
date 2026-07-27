import type { ReactNode } from 'react'
import './ui.css'

type Tone = 'success' | 'warning' | 'danger' | 'neutral'

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
