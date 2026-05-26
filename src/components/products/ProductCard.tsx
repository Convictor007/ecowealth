import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Product } from '@/api/types'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const hasIngredients = Boolean(product.ingredients?.length)

  const clampZoom = useCallback((value: number) => Math.max(1, Math.min(4, value)), [])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setZoomOrigin({ x: 50, y: 50 })
  }, [])

  const openLightbox = useCallback(() => {
    resetZoom()
    setLightboxOpen(true)
  }, [resetZoom])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const updateZoomOrigin = useCallback((clientX: number, clientY: number) => {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    const safeX = Math.max(0, Math.min(100, x))
    const safeY = Math.max(0, Math.min(100, y))
    setZoomOrigin({ x: safeX, y: safeY })
  }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, closeLightbox])

  return (
    <article className="product-card card">
      <div className="product-card__media">
        <button
          type="button"
          className="product-card__image-btn"
          onClick={openLightbox}
          aria-label={`View full size: ${product.name}`}
        >
          <img src={product.image} alt={product.name} loading="lazy" draggable={false} />
          <span className="product-card__expand-hint">Click for full size</span>
        </button>
        <span className="badge badge--category">{product.category}</span>
        {product.certifications && product.certifications.length > 0 && (
          <div className="product-card__certs" aria-label="Certifications">
            {product.certifications.map((cert) => (
              <span key={cert} className="badge badge--cert">
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          {product.available && (
            <span className="badge badge--available">
              <span className="availability-dot" aria-hidden />
              Available at clinic
            </span>
          )}
        </div>
        {product.brand && <p className="product-card__brand">{product.brand}</p>}
        <h3>{product.name}</h3>
        {product.packageSize && (
          <p className="product-card__package">{product.packageSize}</p>
        )}
        <p className="product-card__price">
          <span className="product-card__price-label">Clinic price</span>
          {product.price}
        </p>
        <p className="product-card__desc">{product.description}</p>

        {hasIngredients && (
          <div className="product-card__ingredients">
            <button
              type="button"
              className="product-card__toggle"
              aria-expanded={ingredientsOpen}
              onClick={() => setIngredientsOpen((open) => !open)}
            >
              {ingredientsOpen ? 'Hide ingredients' : 'View ingredients'}
            </button>
            {ingredientsOpen && (
              <ul>
                {product.ingredients!.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {product.dosage && (
          <p className="product-card__dosage">
            <strong>How to use:</strong> {product.dosage}
          </p>
        )}

        {product.warnings?.map((warning) => (
          <p key={warning} className="product-card__warning">
            {warning}
          </p>
        ))}

        <ul className="product-card__benefits">
          {product.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      {lightboxOpen && (
        <div
          className="product-card__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} — full size`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="product-card__lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <div
              ref={viewportRef}
              className="product-card__lightbox-viewport"
              onWheel={(e) => {
                e.preventDefault()
                e.stopPropagation()
                updateZoomOrigin(e.clientX, e.clientY)
                const step = e.deltaY > 0 ? -0.15 : 0.15
                setZoom((z) => clampZoom(z + step))
              }}
              onMouseMove={(e) => {
                if (zoom <= 1.05) return
                updateZoomOrigin(e.clientX, e.clientY)
              }}
              onDoubleClick={(e) => {
                updateZoomOrigin(e.clientX, e.clientY)
                setZoom((z) => (z > 1.05 ? 1 : 2.5))
              }}
              style={
                {
                  '--zoom': zoom,
                  '--zoom-origin-x': `${zoomOrigin.x}%`,
                  '--zoom-origin-y': `${zoomOrigin.y}%`,
                } as CSSProperties
              }
              aria-label="Zoomable product image (mouse wheel to zoom)"
              role="application"
            >
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-card__lightbox-controls" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="product-card__lightbox-zoom-btn"
                onClick={() => setZoom((z) => clampZoom(z - 0.5))}
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="product-card__lightbox-zoom-label">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="product-card__lightbox-zoom-btn"
                onClick={() => setZoom((z) => clampZoom(z + 0.5))}
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                className="product-card__lightbox-zoom-btn product-card__lightbox-zoom-btn--reset"
                onClick={resetZoom}
                aria-label="Reset zoom"
              >
                Reset
              </button>
            </div>

            <figcaption>{product.name}</figcaption>
          </figure>
        </div>
      )}
    </article>
  )
}
