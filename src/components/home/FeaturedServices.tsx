import { Link } from 'react-router-dom'
import './FeaturedServices.css'

const FEATURED = [
  {
    title: 'Colon Hydrotherapy',
    description: 'Professional cleansing to support digestive wellness and detoxification.',
    benefits: ['Detoxification', 'Improved digestion', 'Increased energy'],
    image: '/assets/images/colonics-labatiba-machine.jpg',
  },
  {
    title: 'Therapeutic Massage & Wellness',
    description:
      'Holistic bodywork to ease tension, support relaxation, and complement your naturopathic healing plan.',
    benefits: ['Stress relief', 'Relaxation', 'Natural drug-free care'],
    image: '/assets/images/massages.png',
  },
  {
    title: 'Iridology Assessment',
    description: 'Iris-based health mapping for early insight and preventive planning.',
    benefits: ['Early detection', 'Personalized plans', 'Holistic analysis'],
    image: '/assets/images/product-iridology.jpg',
  },
  {
    title: 'Herbal Consultation',
    description: 'Custom herbal guidance tailored to your constitution and goals.',
    benefits: ['Natural remedies', 'Expert guidance', 'Long-term wellness'],
    image: '/assets/images/featured-herbal.jpg',
  },
  {
    title: 'In-clinic products',
    description: 'ONEWAYHI herbal coffees, supplements, eye drops, and wellness kits at our dispensary.',
    benefits: ['Quality sourced', 'Staff guidance', 'Available on visit'],
    image: '/assets/images/product-collagen-premium-coffee.jpg',
  },
]

export default function FeaturedServices() {
  return (
    <section className="section">
      <div className="container">
        <header className="section__header">
          <span className="section__eyebrow">Patient care</span>
          <h2 className="section__title">Services at our clinic</h2>
          <p className="section__lead">
            In-clinic treatments and assessments provided by our naturopathic team.
          </p>
        </header>
        <div className="featured-services__grid">
          {FEATURED.map((s) => (
            <article key={s.title} className="card featured-services__card">
              <div className="featured-services__media">
                <img src={s.image} alt={s.title} loading="lazy" />
              </div>
              <div className="featured-services__body">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <ul>
                  {s.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <p className="featured-services__more">
          <Link to="/services">View all services and treatment information</Link>
        </p>
      </div>
    </section>
  )
}
