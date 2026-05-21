import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './FeatureCards.css'

const CARDS = [
  {
    title: 'Colon Hydrotherapy',
    description:
      'Professional colon cleansing with modern equipment and trained naturopathic care.',
    link: '/services',
    linkLabel: 'View service details',
  },
  {
    title: 'Therapeutic Massage & Wellness',
    description:
      'In-clinic massage and holistic wellness sessions for relaxation and recovery.',
    link: '/services',
    linkLabel: 'View service details',
  },
  {
    title: 'Iridology Consultation',
    description:
      'Non-invasive iris assessment to support personalized wellness planning.',
    link: '/services',
    linkLabel: 'View service details',
  },
  {
    title: 'Herbal & Wellness Products',
    description:
      'Herbal coffee, supplements, and kits available for purchase at our clinic.',
    link: '/products',
    linkLabel: 'See what we sell',
  },
]

export default function FeatureCards() {
  return (
    <section className="section section--alt">
      <div className="container">
        <header className="section__header">
          <span className="section__eyebrow">Our specialties</span>
          <h2 className="section__title">Care we provide</h2>
          <p className="section__lead">
            Integrated naturopathic services and in-clinic wellness products under one roof.
          </p>
        </header>
        <div className="feature-cards__grid">
          {CARDS.map((card) => (
            <article key={card.title} className="card feature-cards__item">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.link} className="feature-cards__link">
                {card.linkLabel}
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
