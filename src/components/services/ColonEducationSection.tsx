import { useEffect, useState, useCallback } from 'react'
import { getColonEducation } from '@/api/content'
import type { ColonEducationSection as ColonEducationItem } from '@/api/types'
import './ColonEducationSection.css'

export default function ColonEducationSection() {
  const [sections, setSections] = useState<ColonEducationItem[]>([])
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  useEffect(() => {
    getColonEducation()
      .then((data) => setSections(data.sections))
      .catch(console.error)
  }, [])

  const closeLightbox = useCallback(() => setExpandedImage(null), [])

  useEffect(() => {
    if (!expandedImage) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expandedImage, closeLightbox])

  if (sections.length === 0) return null

  return (
    <section className="colon-education" aria-labelledby="colon-education-heading">
      <header className="colon-education__header">
        <span className="colon-education__eyebrow">Patient education</span>
        <h2 id="colon-education-heading">Understanding colon &amp; gut health</h2>
        <p className="colon-education__lead">
          Key concepts we discuss at the clinic, converted into easy-to-read notes. Tap an image to
          view it larger. For personalized advice, book a free check-up with our practitioner.
        </p>
      </header>

      <div className="colon-education__list">
        {sections.map((item) => (
          <article key={item.id} className="colon-education__card card">
            <figure className="colon-education__figure">
              <button
                type="button"
                className="colon-education__image-btn"
                onClick={() => setExpandedImage(item.image)}
                aria-label={`View full image: ${item.title}`}
              >
                <img src={item.image} alt={item.imageAlt} loading="lazy" />
                <span className="colon-education__zoom-hint">Tap to enlarge</span>
              </button>
            </figure>

            <div className="colon-education__content">
              <h3>{item.title}</h3>
              {item.subtitle && <p className="colon-education__subtitle">{item.subtitle}</p>}
              <p className="colon-education__summary">{item.summary}</p>

              {item.topics?.map((topic) => (
                <div key={topic.heading} className="colon-education__topic">
                  <h4>{topic.heading}</h4>
                  <ul>
                    {topic.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {item.symptoms && item.symptoms.length > 0 && (
                <div className="colon-education__topic">
                  <h4>Common symptoms to discuss with us</h4>
                  <ul className="colon-education__symptoms">
                    {item.symptoms.map((symptom) => (
                      <li key={symptom}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.credit && <p className="colon-education__credit">{item.credit}</p>}
            </div>
          </article>
        ))}
      </div>

      {expandedImage && (
        <div
          className="colon-education__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged educational chart"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="colon-education__lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={expandedImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
