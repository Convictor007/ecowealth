import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@/api/types'
import './HeroSlider.css'

interface HeroSliderProps {
  slides: HeroSlide[]
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const slide = slides[active]

  return (
    <section className="clinic-hero">
      <div className="container clinic-hero__inner">
        <div className="clinic-hero__content">
          <span className="clinic-hero__badge">{slide.badge}</span>
          <h1>
            {slide.title}
            <span>{slide.subtitle}</span>
          </h1>
          <p className="clinic-hero__desc">{slide.description}</p>
          <p className="clinic-hero__services">{slide.services}</p>
          <div className="clinic-hero__actions">
            <Link to="/services" className="btn btn--outline">
              Our services
            </Link>
          </div>
          <div className="clinic-hero__meta">
            <div>
              <span>Clinic location</span>
              <p>{slide.location}</p>
            </div>
            <div>
              <span>Phone</span>
              <p>
                <a href="tel:09516114125">{slide.phone}</a>
              </p>
            </div>
          </div>
        </div>
        <div className="clinic-hero__visual">
          <img
            src={slide.image}
            alt={`${slide.title} — ${slide.subtitle}`}
            loading={active === 0 ? 'eager' : 'lazy'}
            onError={(e) => {
              const img = e.currentTarget
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1'
                img.src = '/assets/images/massages.png'
              }
            }}
          />
        </div>
      </div>

      <div className="clinic-hero__controls container">
        <div className="clinic-hero__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? 'clinic-hero__dot clinic-hero__dot--active' : 'clinic-hero__dot'}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="clinic-hero__arrows">
          <button type="button" onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => setActive((i) => (i + 1) % slides.length)} aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
