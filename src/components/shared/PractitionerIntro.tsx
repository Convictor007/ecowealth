import { Award } from 'lucide-react'
import { PRACTITIONER } from '@/constants/practitioner'
import './PractitionerIntro.css'

interface PractitionerIntroProps {
  variant?: 'featured' | 'compact'
  id?: string
}

export default function PractitionerIntro({
  variant = 'featured',
  id,
}: PractitionerIntroProps) {
  if (variant === 'compact') {
    return (
      <div className="practitioner-compact" id={id}>
        <div className="practitioner-compact__photo">
          <img
            src={PRACTITIONER.image}
            alt={PRACTITIONER.name}
            width={56}
            height={56}
          />
        </div>
        <div>
          <p className="practitioner-compact__label">Your naturopathic practitioner</p>
          <p className="practitioner-compact__name">{PRACTITIONER.name}</p>
          <p className="practitioner-compact__title">{PRACTITIONER.title}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="practitioner-intro" id={id} aria-labelledby="practitioner-heading">
      <div className="practitioner-intro__grid">
        <div className="practitioner-intro__photo-wrap">
          <img
            src={PRACTITIONER.image}
            alt={`${PRACTITIONER.name} — ${PRACTITIONER.title} at Eco Wealth Wellnessolution`}
            className="practitioner-intro__photo"
            loading="lazy"
          />
        </div>
        <div className="practitioner-intro__content">
          <span className="section__eyebrow">Meet your practitioner</span>
          <h2 id="practitioner-heading">{PRACTITIONER.name}</h2>
          <p className="practitioner-intro__title">{PRACTITIONER.title}</p>
          <p className="practitioner-intro__bio">{PRACTITIONER.bio}</p>
          <ul className="practitioner-intro__credentials">
            {PRACTITIONER.credentials.map((item) => (
              <li key={item}>
                <Award size={18} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
