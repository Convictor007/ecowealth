import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { getColonicsMedia } from '@/api/content'
import type { ColonicsMedia } from '@/api/types'
import { COLONICS_CONDITIONS } from '@/constants/colonicsConditions'
import './ColonicsSection.css'

const DEFAULT_MEDIA: ColonicsMedia = {
  serviceName: 'Modern Labatiba colon hydrotherapy',
  machine: {
    src: '/assets/images/colonics-labatiba-machine.jpg',
    alt: 'Modern Labatiba colon cleansing machine at ECOWEALTH Wellnessolution',
    caption: 'Modern colon cleansing machine — the Seven Rs of colon hydrotherapy',
  },
  poster: {
    src: '/assets/images/labatiba-poster.jpg',
    alt: 'Modern Labatiba colon cleansing — before and after',
    caption: 'Modern Labatiba — 100% natural colon cleansing',
  },
  before: {
    src: '/assets/images/colon-before.png',
    alt: 'Before colon hydrotherapy — congested colon with accumulated waste',
    label: 'Before',
    caption: 'Accumulated waste and toxins in the bowel',
  },
  after: {
    src: '/assets/images/colon-after.png',
    alt: 'After colon hydrotherapy — cleansed healthy colon',
    label: 'After',
    caption: 'Cleansed colon — improved comfort and vitality',
  },
}

export default function ColonicsSection() {
  const [media, setMedia] = useState<ColonicsMedia>(DEFAULT_MEDIA)

  useEffect(() => {
    getColonicsMedia()
      .then(setMedia)
      .catch(() => setMedia(DEFAULT_MEDIA))
  }, [])

  const midpoint = Math.ceil(COLONICS_CONDITIONS.length / 2)
  const leftCol = COLONICS_CONDITIONS.slice(0, midpoint)
  const rightCol = COLONICS_CONDITIONS.slice(midpoint)

  return (
    <section className="colonics-section" aria-labelledby="colonics-heading">
      <div className="colonics-section__intro">
        <span className="colonics-section__badge">100% Natural</span>
        <h2 id="colonics-heading">Scientific Colonics Cleansing</h2>
        <p className="colonics-section__subtitle">
          {media.serviceName ?? 'New Hi-Tech & Hygienic Colonics Machine'}
        </p>
        <p className="colonics-section__desc">
          Based on the methods of Dr. Bernard Jensen—supporting natural elimination of toxins
          through professional in-clinic colon hydrotherapy (Modern Labatiba). No drugs, no pain,
          no operation.
        </p>
      </div>

      {media.poster && (
        <figure className="colonics-section__poster">
          <div className="colonics-section__poster-visual">
            <img src={media.poster.src} alt={media.poster.alt} loading="lazy" />
          </div>
          {media.poster.caption && <figcaption>{media.poster.caption}</figcaption>}
        </figure>
      )}

      <figure className="colonics-section__machine">
        <div className="colonics-section__machine-visual">
          <img src={media.machine.src} alt={media.machine.alt} loading="lazy" />
        </div>
        {media.machine.caption && (
          <figcaption>{media.machine.caption}</figcaption>
        )}
        {media.imageCredit && (
          <p className="colonics-section__credit">{media.imageCredit}</p>
        )}
      </figure>

      <div className="colonics-ba">
        <header className="colonics-ba__header">
          <h3 className="colonics-ba__title">Before &amp; After</h3>
          <p className="colonics-ba__lead">
            Clinical comparison — colon condition before and after hydrotherapy
          </p>
        </header>

        <div className="colonics-ba__compare">
          <figure className="colonics-ba__card colonics-ba__card--before">
            <div className="colonics-ba__media">
              <span className="colonics-ba__badge">{media.before.label ?? 'Before'}</span>
              <img src={media.before.src} alt={media.before.alt} loading="lazy" />
            </div>
            <figcaption className="colonics-ba__caption">
              <p>{media.before.caption}</p>
            </figcaption>
          </figure>

          <div className="colonics-ba__divider" aria-hidden>
            <span className="colonics-ba__divider-icon">
              <ArrowRight size={22} strokeWidth={2.5} />
            </span>
          </div>

          <figure className="colonics-ba__card colonics-ba__card--after">
            <div className="colonics-ba__media">
              <span className="colonics-ba__badge">{media.after.label ?? 'After'}</span>
              <img src={media.after.src} alt={media.after.alt} loading="lazy" />
            </div>
            <figcaption className="colonics-ba__caption">
              <p>{media.after.caption}</p>
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="colonics-section__banner">
        NO DRUGS · NO PAIN · NO OPERATION · NO SIDE EFFECTS
      </div>

      <div className="colonics-section__effective">
        <h3>Effective for</h3>
        <p className="colonics-section__effective-note">
          Patients visit our clinic seeking support for the following conditions (26 listed):
        </p>
        <div className="conditions-list">
          <ul>
            {leftCol.map((condition) => (
              <li key={condition}>
                <CheckCircle2 size={16} aria-hidden />
                {condition}
              </li>
            ))}
          </ul>
          <ul>
            {rightCol.map((condition) => (
              <li key={condition}>
                <CheckCircle2 size={16} aria-hidden />
                {condition}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
