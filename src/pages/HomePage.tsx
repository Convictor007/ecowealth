import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FeatureCards from '@/components/home/FeatureCards'
import HomeHero from '@/components/home/HomeHero'
import { SITE_BRAND } from '@/constants/clinic'
import { PRACTITIONER } from '@/constants/practitioner'
import './HomePage.css'

export default function HomePage() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#about') {
      const id = location.hash.slice(1)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <div className="home-page">
      <HomeHero />

      <section className="section home-page__intro">
        <div className="container home-highlights">
          <article className="card home-highlight home-highlight--colonics">
            <div
              className="home-highlight__bg"
              style={{ backgroundImage: "url('/assets/images/colonics-labatiba-machine.jpg')" }}
              aria-hidden
            />
            <div className="home-highlight__inner">
              <span className="home-highlight__tag">Featured treatment</span>
              <h2>Scientific colon hydrotherapy</h2>
              <p>
                Gentle, professional colon cleansing with modern hygienic equipment—personally
                overseen by {PRACTITIONER.name}.
              </p>
              <Link to="/services">Learn about colonics</Link>
            </div>
          </article>
          <article className="card home-highlight home-highlight--practitioner">
            <div
              className="home-highlight__bg"
              style={{ backgroundImage: "url('/assets/images/hero-clinic.jpg')" }}
              aria-hidden
            />
            <div className="home-highlight__inner">
              <span className="home-highlight__tag">Why visit us</span>
              <h2>Drug-free, in-clinic care</h2>
              <p>
                Naturopathic services and wellness products under one roof in the Bicol Region—safe,
                hygienic, and practitioner-guided.
              </p>
              <Link to="/contact">Meet our practitioner</Link>
            </div>
          </article>
        </div>
      </section>

      <FeatureCards />

      <section id="about" className="section section--alt">
        <div className="container home-about">
          <div className="home-about__text">
            <span className="section__eyebrow">About the clinic</span>
            <h2 className="section__title home-about__brand">
              <span className="home-about__brand-name">{SITE_BRAND.name}</span>
              <span className="home-about__brand-tag">{SITE_BRAND.tagline}</span>
            </h2>
            <p>
              Founded by {PRACTITIONER.name}, {SITE_BRAND.full} is a naturopathic wellness clinic
              serving patients in the Bicol Region and across the Philippines. We combine colon
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
