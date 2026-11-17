'use client'

/**
 * ScholarBot mascot — a friendly graduation-cap owl.
 * Variants: `idle` (gentle bob), `wave` (waves hello), `thinking` (peeking).
 */
interface MascotProps {
  size?: number
  variant?: 'idle' | 'wave' | 'thinking'
  className?: string
}

export function Mascot({ size = 96, variant = 'idle', className = '' }: MascotProps) {
  const animClass = variant === 'idle' ? 'ss-bob' : variant === 'wave' ? 'ss-wave' : ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`${animClass} ${className}`}
      aria-hidden="true"
    >
      {/* Body / head — rounded */}
      <ellipse cx="60" cy="70" rx="34" ry="32" fill="oklch(0.55 0.155 165)" />
      <ellipse cx="60" cy="70" rx="34" ry="32" fill="none" stroke="oklch(0.40 0.13 165)" strokeWidth="2" />
      {/* Belly highlight */}
      <ellipse cx="60" cy="78" rx="22" ry="18" fill="oklch(0.70 0.10 165)" opacity="0.65" />
      {/* Eye whites */}
      <circle cx="48" cy="62" r="10" fill="#fff" />
      <circle cx="72" cy="62" r="10" fill="#fff" />
      {/* Pupils */}
      <circle cx="50" cy="64" r="4.5" fill="oklch(0.21 0.035 240)" />
      <circle cx="74" cy="64" r="4.5" fill="oklch(0.21 0.035 240)" />
      <circle cx="51.5" cy="62.5" r="1.4" fill="#fff" />
      <circle cx="75.5" cy="62.5" r="1.4" fill="#fff" />
      {/* Beak */}
      <path d="M 56 72 Q 60 80 64 72 Q 60 75 56 72 Z" fill="oklch(0.78 0.16 70)" stroke="oklch(0.60 0.14 60)" strokeWidth="1" />
      {/* Graduation cap — mortarboard */}
      <g>
        <polygon points="60,18 90,28 60,38 30,28" fill="oklch(0.20 0.04 240)" />
        <polygon points="60,38 90,28 60,33 30,28" fill="oklch(0.30 0.05 240)" />
        {/* Cap button + tassel */}
        <circle cx="60" cy="33" r="2.4" fill="oklch(0.95 0.04 70)" />
        <path d="M 60 33 L 78 33 L 78 50" stroke="oklch(0.78 0.16 70)" strokeWidth="2" fill="none" />
        <circle cx="78" cy="51" r="3" fill="oklch(0.78 0.16 70)" />
      </g>
      {/* Tiny feet */}
      <ellipse cx="48" cy="104" rx="6" ry="3" fill="oklch(0.78 0.16 70)" />
      <ellipse cx="72" cy="104" rx="6" ry="3" fill="oklch(0.78 0.16 70)" />
      {/* Cheeks */}
      <circle cx="42" cy="76" r="3" fill="oklch(0.78 0.16 60)" opacity="0.6" />
      <circle cx="78" cy="76" r="3" fill="oklch(0.78 0.16 60)" opacity="0.6" />
    </svg>
  )
}
