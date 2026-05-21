import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'
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
          <a href="tel:09516114125" className="btn btn--primary">
            <Phone size={18} />
            0951 611 4125
          </a>
          <Link to="/contact" className="btn btn--outline">
            Contact clinic
          </Link>
        </div>
      </div>
    </section>
  )
}
