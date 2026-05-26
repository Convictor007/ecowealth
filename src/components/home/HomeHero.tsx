import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import BookAppointmentButton from '@/components/appointment/BookAppointmentButton'
import { BOOKING_CTA, SITE_BRAND } from '@/constants/clinic'
import { PRACTITIONER } from '@/constants/practitioner'
import './HomeHero.css'

const HERO_BACKGROUNDS = [
  {
    src: '/assets/images/massages.png',
    position: '72% 35%',
  },
  {
    src: '/assets/images/hero-checkup.png',
    position: '75% center',
  },
] as const

const ROTATE_MS = 6000
const FADE_MS = 1200

const SERVICES_LINE =
  'Colon hydrotherapy · Therapeutic massage · Iridology · Herbal products'

export default function HomeHero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (HERO_BACKGROUNDS.length <= 1) return
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % HERO_BACKGROUNDS.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="home-hero" aria-label="Welcome to ECOWEALTH Wellnessolution">
      <div
        className="home-hero__bg"
        aria-hidden
        aria-live="polite"
        style={{ '--hero-fade-ms': `${FADE_MS}ms` } as CSSProperties}
      >
        {HERO_BACKGROUNDS.map((bg, index) => (
          <div
            key={bg.src}
            className={
              index === active
                ? 'home-hero__bg-slide home-hero__bg-slide--active'
                : 'home-hero__bg-slide'
            }
          >
            <img
              src={bg.src}
              alt=""
              className="home-hero__bg-img"
              style={{ objectPosition: bg.position }}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
            />
          </div>
        ))}
        <div className="home-hero__overlay" />
      </div>

      <div className="container home-hero__layout">
        <div className="home-hero__content">
        <span className="home-hero__badge">Community offer</span>

        <h1 className="home-hero__title">
          Free general check-up
          <span className="home-hero__title-sub">
            Health awareness through iridology — open to all residents
          </span>
        </h1>

        <p className="home-hero__brand">
          <span className="home-hero__brand-name">{SITE_BRAND.name}</span>
          <span className="home-hero__brand-tag">{SITE_BRAND.tagline}</span>
        </p>

        <p className="home-hero__lead">
          Your trusted partner in holistic wellness and natural healing — personally guided by{' '}
          {PRACTITIONER.name}.
        </p>

        <p className="home-hero__services">{SERVICES_LINE}</p>

        <div className="home-hero__actions">
          <BookAppointmentButton
            className="home-hero__btn home-hero__btn--primary"
            label={BOOKING_CTA.label}
          />
          <Link to="/services" className="btn btn--outline home-hero__btn home-hero__btn--ghost">
            Our services
          </Link>
          <Link
            to="/location"
            className="btn btn--outline home-hero__btn home-hero__btn--ghost home-hero__btn--location"
          >
            <MapPin size={18} aria-hidden />
            Location
          </Link>
        </div>

        <div className="home-hero__meta">
          <a href={`tel:${BOOKING_CTA.phone.replace(/\s/g, '')}`} className="home-hero__meta-item">
            <Phone size={18} aria-hidden />
            <span>
              <strong>Call to book</strong>
              {BOOKING_CTA.phone}
            </span>
          </a>
          <div className="home-hero__meta-item">
            <MapPin size={18} aria-hidden />
            <span>
              <strong>Clinic</strong>
              Bicol Region, Philippines
            </span>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
