import { useEffect, useState } from 'react'
import { Droplet, Eye, FlaskConical, Hand, Leaf, Pill } from 'lucide-react'
import { getServices } from '@/api/content'
import type { Service } from '@/api/types'
import ColonicsSection from '@/components/services/ColonicsSection'
import WellnessMassageSection from '@/components/services/WellnessMassageSection'
import PractitionerIntro from '@/components/shared/PractitionerIntro'
import PageHero from '@/components/shared/PageHero'
import './ServicesPage.css'

const ICON_MAP = {
  leaf: Leaf,
  pill: Pill,
  eye: Eye,
  flask: FlaskConical,
  droplet: Droplet,
  hand: Hand,
} as const

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    getServices().then(setServices).catch(console.error)
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Treatments"
        title="Clinic services"
        description="Naturopathic care at ECOWEALTH Wellnessolution — colon hydrotherapy, therapeutic massage, iridology, herbology, and more. By appointment."
      />

      <div className="services-page">
        <div className="container">
          <div className="services-page__practitioner">
            <PractitionerIntro />
          </div>
          <ColonicsSection />
          <WellnessMassageSection />

          <section className="services-page__all">
            <header className="section__header">
              <span className="section__eyebrow">What we offer</span>
              <h2 className="section__title">All clinic services</h2>
              <p className="section__lead">
                Personalized naturopathic services delivered in-clinic by Edgar Bustamante, N.D. and team.
              </p>
            </header>
            <div className="services-grid">
              {services.map((service) => {
                const Icon = ICON_MAP[service.icon as keyof typeof ICON_MAP] ?? Leaf
                return (
                  <article key={service.id} className="card service-card">
                    <div className="service-card__icon">
                      <Icon size={26} color="var(--green)" />
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul>
                      {service.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
