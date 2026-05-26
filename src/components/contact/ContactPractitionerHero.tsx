import { Link } from 'react-router-dom'
import { Award, Calendar, MapPin, Phone } from 'lucide-react'
import BookAppointmentButton from '@/components/appointment/BookAppointmentButton'
import { useAppointmentModal } from '@/context/AppointmentModalContext'
import { BOOKING_CTA, SITE_BRAND } from '@/constants/clinic'
import { PRACTITIONER } from '@/constants/practitioner'
import './ContactPractitionerHero.css'

const HERO_LEAD = `${PRACTITIONER.name} founded ${SITE_BRAND.full} to offer colon hydrotherapy, iridology, herbology, and natural wellness products — safe, drug-free, in-clinic care across the Philippines.`

const QUICK_FEATURES = [
  {
    icon: Phone,
    title: 'Call the clinic',
    description: BOOKING_CTA.phone,
    href: `tel:${BOOKING_CTA.phone.replace(/\s/g, '')}`,
    external: true,
  },
  {
    icon: Calendar,
    title: 'Book online',
    description: 'Free check-up & consultations',
    action: 'book' as const,
  },
  {
    icon: MapPin,
    title: 'Visit us',
    description: 'Bicol Region, Philippines',
    href: '/location',
    external: false,
  },
]

export default function ContactPractitionerHero() {
  const { openAppointmentModal } = useAppointmentModal()

  return (
    <section className="contact-hero" aria-labelledby="contact-hero-heading">
      <div className="contact-hero__backdrop" aria-hidden />

      <div className="contact-hero__main">
        <div className="container contact-hero__layout">
          <div className="contact-hero__copy">
            <span className="contact-hero__eyebrow">Meet your practitioner</span>
            <h1 id="contact-hero-heading" className="contact-hero__title">
              Making Health Care Better Together
            </h1>
            <p className="contact-hero__lead">{HERO_LEAD}</p>

            <ul className="contact-hero__credentials">
              {PRACTITIONER.credentials.map((item) => (
                <li key={item}>
                  <Award size={16} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="contact-hero__actions">
              <BookAppointmentButton
                className="contact-hero__btn contact-hero__btn--primary"
                label="Make an appointment"
              />
              <Link to="/services" className="btn contact-hero__btn contact-hero__btn--outline">
                View services
              </Link>
            </div>
          </div>

          <div className="contact-hero__portrait-col" aria-hidden="true">
            <img
              src={PRACTITIONER.image}
              alt={`${PRACTITIONER.name} — ${PRACTITIONER.title}`}
              className="contact-hero__photo"
              width={750}
              height={940}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <div className="contact-hero__features-band">
        <div className="container">
          <ul className="contact-hero__features">
            {QUICK_FEATURES.map((feature) => {
              const Icon = feature.icon
              const content = (
                <>
                  <span className="contact-hero__feature-icon" aria-hidden>
                    <Icon size={26} strokeWidth={1.75} />
                  </span>
                  <span className="contact-hero__feature-text">
                    <span className="contact-hero__feature-title">{feature.title}</span>
                    <span className="contact-hero__feature-desc">{feature.description}</span>
                  </span>
                </>
              )

              if (feature.action === 'book') {
                return (
                  <li key={feature.title}>
                    <button
                      type="button"
                      className="contact-hero__feature-card"
                      onClick={openAppointmentModal}
                    >
                      {content}
                    </button>
                  </li>
                )
              }

              if (feature.external) {
                return (
                  <li key={feature.title}>
                    <a href={feature.href} className="contact-hero__feature-card">
                      {content}
                    </a>
                  </li>
                )
              }

              return (
                <li key={feature.title}>
                  <Link to={feature.href!} className="contact-hero__feature-card">
                    {content}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
