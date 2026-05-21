import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { getWellnessMassage } from '@/api/content'
import type { WellnessMassageContent } from '@/api/types'
import './WellnessMassageSection.css'

const DEFAULT: WellnessMassageContent = {
  title: 'Therapeutic Massage & Holistic Wellness',
  subtitle: 'Relaxation, recovery, and natural balance',
  description:
    'Complement your naturopathic care with in-clinic therapeutic massage and holistic wellness sessions at Eco Wealth Wellnessolution.',
  image: {
    src: '/assets/images/massages.png',
    alt: 'Therapeutic back massage in-clinic at Eco Wealth',
  },
  benefits: [
    'Relieves muscle tension and stress',
    'Supports relaxation and better sleep',
    'Improves circulation and flexibility',
  ],
  note: 'Available in-clinic by appointment.',
}

export default function WellnessMassageSection() {
  const [content, setContent] = useState<WellnessMassageContent>(DEFAULT)

  useEffect(() => {
    getWellnessMassage()
      .then(setContent)
      .catch(() => setContent(DEFAULT))
  }, [])

  return (
    <section className="wellness-section" aria-labelledby="wellness-heading">
      <div className="wellness-section__grid">
        <div className="wellness-section__media">
          <img
            src={content.image.src}
            alt={content.image.alt}
            loading="lazy"
          />
        </div>
        <div className="wellness-section__content">
          <span className="wellness-section__badge">In-clinic service</span>
          <h2 id="wellness-heading">{content.title}</h2>
          <p className="wellness-section__subtitle">{content.subtitle}</p>
          <p className="wellness-section__desc">{content.description}</p>
          <ul className="wellness-section__benefits">
            {content.benefits.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          {content.note && (
            <p className="wellness-section__note">{content.note}</p>
          )}
        </div>
      </div>
    </section>
  )
}
