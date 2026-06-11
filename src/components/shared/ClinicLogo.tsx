import type { CSSProperties } from 'react'
import logoIconSrc from '@/assets/ecowealth_v2_logo-removebg.png'
import logoTextSrc from '@/assets/ecowealth_v3_logo_text.png'
import './ClinicLogo.css'

interface ClinicLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const ICON_HEIGHTS = { sm: 44, md: 54, lg: 66 } as const

export default function ClinicLogo({
  size = 'md',
  showText = true,
  className = '',
}: ClinicLogoProps) {
  const iconHeight = ICON_HEIGHTS[size]
  return (
    <span
      className={`clinic-logo clinic-logo--${size} ${showText ? 'clinic-logo--with-text' : ''} ${className}`.trim()}
      style={{ '--logo-icon-height': `${iconHeight}px` } as CSSProperties}
    >
      <img
        src={logoIconSrc}
        alt=""
        className="clinic-logo__icon"
        height={iconHeight}
        loading="lazy"
        decoding="async"
        aria-hidden
      />
      {showText && (
        <img
          src={logoTextSrc}
          alt="ECO-WEALTH Medical Equipment Manufacturing"
          className="clinic-logo__text"
          loading="lazy"
          decoding="async"
        />
      )}
    </span>
  )
}
