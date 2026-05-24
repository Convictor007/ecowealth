import { useEffect, useState } from 'react'
import { Bus, Car, MapPin, Navigation, Phone } from 'lucide-react'
import { getClinicInfo } from '@/api/content'
import type { ClinicInfo } from '@/api/types'
import { SITE_BRAND } from '@/constants/clinic'
import PageHero from '@/components/shared/PageHero'
import './LocationPage.css'

export default function LocationPage() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null)

  useEffect(() => {
    getClinicInfo().then(setClinic).catch(console.error)
  }, [])

  const openDirections = () => {
    if (!clinic) return
    const { lat, lng } = clinic.coordinates
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  const openMapView = () => {
    if (!clinic) return
    const { lat, lng } = clinic.coordinates
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }

  const mapEmbedUrl = clinic
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15607!2d${clinic.coordinates.lng}!3d${clinic.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDI2JzMzLjkiTiAxMjPCsDI0JzE1LjYiRQ!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph`
    : ''

  return (
    <>
      <PageHero
        eyebrow="Find us"
        title="Clinic location"
        description={`Visit ${SITE_BRAND.full} in the Bicol Region. Use the map below for directions.`}
      />
      <div className="page-shell">
        <div className="container">
          <article className="card location-address">
            <MapPin size={36} color="var(--green)" />
            <div>
              <h2 className="location-address__brand">
                <span>{SITE_BRAND.name}</span>
                <span>{SITE_BRAND.tagline}</span>
              </h2>
              <p>
                ONEWAYHI Health and Wellness
                <br />
                Bicol Region, Philippines
              </p>
            </div>
          </article>

          <section className="card location-map">
            <h2>Map & directions</h2>
            {mapEmbedUrl && (
              <div className="location-map__embed">
                <iframe src={mapEmbedUrl} title="Clinic location map" loading="lazy" allowFullScreen />
              </div>
            )}
            <div className="location-map__actions">
              <button type="button" className="btn btn--primary" onClick={openDirections}>
                <Navigation size={18} />
                Get directions
              </button>
              <button type="button" className="btn btn--outline" onClick={openMapView}>
                Open in Google Maps
              </button>
            </div>
            {clinic && (
              <p className="location-map__coords">
                {clinic.coordinates.lat}° N, {clinic.coordinates.lng}° E
              </p>
            )}
          </section>

          <section className="card location-tips">
            <h2>Getting here</h2>
            <div className="location-tips__item">
              <Car size={20} color="var(--green)" />
              <div>
                <h3>By car</h3>
                <p>Navigate to Bicol Region using GPS. Contact us if you need turn-by-turn guidance.</p>
              </div>
            </div>
            <div className="location-tips__item">
              <Bus size={20} color="var(--green)" />
              <div>
                <h3>Public transport</h3>
                <p>Buses and jeepneys serve the region. Call ahead for local transport advice.</p>
              </div>
            </div>
            <div className="location-tips__item">
              <Phone size={20} color="var(--green)" />
              <div>
                <h3>Need help?</h3>
                <p>
                  <a href="tel:09516114125">0951 611 4125</a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
