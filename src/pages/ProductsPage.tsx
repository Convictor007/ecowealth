import { useEffect, useState } from 'react'
import { getProducts } from '@/api/content'
import type { Product } from '@/api/types'
import { CLINIC_PHONES, SITE_BRAND } from '@/constants/clinic'
import PageHero from '@/components/shared/PageHero'
import ProductCard from '@/components/products/ProductCard'
import './ProductsPage.css'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  const availableCount = products.filter((p) => p.available).length

  return (
    <>
      <PageHero
        eyebrow="Clinic dispensary"
        title="Wellness products we offer"
        description={`${SITE_BRAND.full} carries naturopathic and herbal products for your wellness journey. Items below are available for purchase at our clinic—no online ordering.`}
      />

      <div className="page-shell">
        <div className="container">
          <div className="products-intro card">
            <p>
              <strong>We sell these products at our clinic.</strong> Pricing is listed for
              reference. Stock may vary—please visit us in Bicol Region or call{' '}
              <a href={`tel:${CLINIC_PHONES.primary.replace(/\s/g, '')}`}>{CLINIC_PHONES.primary}</a>{' '}
              before your trip.
            </p>
            {availableCount > 0 && (
              <span className="products-intro__stat">
                {availableCount} product{availableCount !== 1 ? 's' : ''} currently offered
              </span>
            )}
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <p className="products-note">
            Questions about products? Visit the clinic or use <strong>Book free check-up</strong> in
            the header to speak with our practitioner.
          </p>
        </div>
      </div>
    </>
  )
}
