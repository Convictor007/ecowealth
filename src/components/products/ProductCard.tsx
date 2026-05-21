import type { Product } from '@/api/types'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card card">
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="badge badge--category">{product.category}</span>
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
        <h3>{product.name}</h3>
        <p className="product-card__price">
          <span className="product-card__price-label">Clinic price</span>
          {product.price}
        </p>
        <p className="product-card__desc">{product.description}</p>
        <ul className="product-card__benefits">
          {product.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
