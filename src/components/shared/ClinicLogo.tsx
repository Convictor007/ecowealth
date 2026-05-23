import './ClinicLogo.css'

interface ClinicLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = { sm: 40, md: 48, lg: 56 } as const

export default function ClinicLogo({ size = 'md', className = '' }: ClinicLogoProps) {
  const px = SIZES[size]
  return (
    <span
      className={`clinic-logo clinic-logo--${size} ${className}`.trim()}
      style={{ width: px, height: px }}
    >
      <img
        src="/assets/ecowealthicon.jpeg"
        alt="ECOWEALTH Wellnessolution logo"
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
      />
    </span>
  )
}
