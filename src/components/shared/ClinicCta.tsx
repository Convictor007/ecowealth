import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { CLINIC_PHONES } from '@/constants/clinic'
import './ClinicCta.css'

interface ClinicCtaProps {
  title?: string
  text?: string
  variant?: 'default' | 'inline'
}

export default function ClinicCta({
  title = 'Visit our clinic',
  text = 'Products are sold in-clinic. Call or visit us to inquire about availability and pricing.',
  variant = 'default',
}: ClinicCtaProps) {
  return (
    <section className={`clinic-cta clinic-cta--${variant}`}>
      <div className="container clinic-cta__inner">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="clinic-cta__actions">
          <a href={`tel:${CLINIC_PHONES.primary.replace(/\s/g, '')}`} className="btn btn--primary">
            <Phone size={18} />
            {CLINIC_PHONES.primary}
          </a>
          <Link to="/contact" className="btn btn--outline">
            Contact clinic
          </Link>
        </div>
      </div>
    </section>
  )
}
