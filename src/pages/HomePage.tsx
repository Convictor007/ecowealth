import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getHeroSlides } from '@/api/content'
import type { HeroSlide } from '@/api/types'
import FeatureCards from '@/components/home/FeatureCards'
import FeaturedServices from '@/components/home/FeaturedServices'
import HeroSlider from '@/components/home/HeroSlider'
import { BOOKING_CTA, SITE_BRAND } from '@/constants/clinic'
import { PRACTITIONER } from '@/constants/practitioner'
import './HomePage.css'

export default function HomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const location = useLocation()

  useEffect(() => {
    getHeroSlides().then(setSlides).catch(console.error)
  }, [])

  useEffect(() => {
    if (location.hash === '#about') {
      const id = location.hash.slice(1)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <div className="home-page">
      {slides.length > 0 && <HeroSlider slides={slides} />}

      <section className="section">
        <div className="container home-highlights">
          <article className="card home-highlight">
            <span className="home-highlight__tag">Featured treatment</span>
            <h2>Scientific colon hydrotherapy</h2>
            <p>
              Gentle, professional colon cleansing with modern hygienic equipment—personally
              overseen by {PRACTITIONER.name}.
            </p>
            <Link to="/services">Learn about colonics</Link>
          </article>
          <article className="card home-highlight home-highlight--promo">
            <span className="home-highlight__tag">Community offer</span>
            <h2>Free general check-up</h2>
            <p>
              Health awareness through iridology. Use <strong>{BOOKING_CTA.label}</strong> in the
              menu above to schedule—open to all residents.
            </p>
          </article>
        </div>
      </section>

      <FeatureCards />
      <FeaturedServices />

      <section id="about" className="section section--alt">
        <div className="container home-about">
          <div className="home-about__text">
            <span className="section__eyebrow">About the clinic</span>
            <h2 className="section__title home-about__brand">
              <span className="home-about__brand-name">{SITE_BRAND.name}</span>
              <span className="home-about__brand-tag">{SITE_BRAND.tagline}</span>
            </h2>
            <p>
              Founded by {PRACTITIONER.name}, {SITE_BRAND.full} is a naturopathic wellness clinic serving
              patients in the Bicol Region and across the Philippines. We combine colon
              hydrotherapy, iridology, herbal medicine, and in-clinic wellness products under one
              trusted practice.
            </p>
            <p>
              Every visit is guided by trained staff with a focus on natural, drug-free care—helping
              you restore digestive health, gain preventive insight, and support long-term vitality.
            </p>
          </div>
          <div className="home-about__image card">
            <img
              src="/assets/images/about-clinic.jpg"
              alt={`${SITE_BRAND.full} wellness clinic`}
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
