import './ui.css'

const PALETTE = ['#c9a24b', '#8a8071', '#1a1712', '#ad863a', '#6e6658']

function colorFor(seed: string) {
  const code = seed.charCodeAt(0) + (seed.charCodeAt(1) ?? 0)
  return PALETTE[code % PALETTE.length]
}

export function Avatar({ label, size = 32 }: { label: string; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, background: colorFor(label) }}
    >
      {label.slice(0, 2).toUpperCase()}
    </span>
  )
}

export function AvatarStack({ labels }: { labels: string[] }) {
  const shown = labels.slice(0, 3)
  const rest = labels.length - shown.length
  return (
    <span className="avatar-stack">
      {shown.map((label, i) => (
        <Avatar key={i} label={label} size={26} />
      ))}
      {rest > 0 && (
        <span className="avatar avatar-more" style={{ width: 26, height: 26, fontSize: 11 }}>
          +{rest}
        </span>
      )}
    </span>
  )
}
