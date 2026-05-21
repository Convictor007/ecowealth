import './PageHero.css'

interface PageHeroProps {
  eyebrow?: string
  title: string
  description: string
}

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__desc">{description}</p>
      </div>
    </section>
  )
}
