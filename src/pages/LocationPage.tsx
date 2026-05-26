import { useEffect, useState } from 'react'
import { Bus, Car, Clock, MapPin, Navigation } from 'lucide-react'
import { getClinicInfo } from '@/api/content'
import type { ClinicInfo } from '@/api/types'
import { SITE_BRAND } from '@/constants/clinic'
import PageHero from '@/components/shared/PageHero'
import './LocationPage.css'

function mapsEmbedUrl(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`
}

export default function LocationPage() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null)

  useEffect(() => {
    getClinicInfo().then(setClinic).catch(console.error)
  }, [])

  const openDirections = () => {
    if (!clinic) return
    const { lat, lng } = clinic.coordinates
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const openMapView = () => {
    if (!clinic) return
    const { lat, lng } = clinic.coordinates
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Find us"
        title="Visit our clinic"
        description={`Plan your trip to ${SITE_BRAND.full}. View the map and clinic hours below.`}
      />

      <div className="page-shell location-page">
        <div className="container">
          <div className="location-page__grid">
            <aside className="location-page__info">
              <article className="card location-card location-card--primary">
                <div className="location-card__icon-wrap" aria-hidden>
                  <MapPin size={28} />
                </div>
                <h2 className="location-card__title">Clinic address</h2>
                <p className="location-card__brand">
                  <span className="location-card__brand-name">{SITE_BRAND.name}</span>
                  <span className="location-card__brand-tag">{SITE_BRAND.tagline}</span>
                </p>
                {clinic ? (
                  <>
                    <p className="location-card__address">{clinic.address.primary}</p>
                    {clinic.address.clinic && clinic.address.clinic !== clinic.address.primary && (
                      <p className="location-card__address location-card__address--secondary">
                        {clinic.address.clinic}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="location-card__address">Loading address…</p>
                )}
              </article>

              {clinic && (
                <>
                  <article className="card location-card">
                    <div className="location-card__icon-wrap location-card__icon-wrap--muted" aria-hidden>
                      <Clock size={24} />
                    </div>
                    <h2 className="location-card__title">Clinic hours</h2>
                    <dl className="location-hours">
                      <div>
                        <dt>Days</dt>
                        <dd>{clinic.hours.weekdays}</dd>
                      </div>
                      <div>
                        <dt>Hours</dt>
                        <dd>{clinic.hours.time}</dd>
                      </div>
                      {clinic.hours.note && (
                        <div>
                          <dt>Note</dt>
                          <dd>{clinic.hours.note}</dd>
                        </div>
                      )}
                    </dl>
                  </article>

                </>
              )}
            </aside>

            <section className="location-page__map" aria-labelledby="location-map-heading">
              <div className="location-map card">
                <div className="location-map__header">
                  <h2 id="location-map-heading">Map &amp; directions</h2>
                  <p>Open in Google Maps for turn-by-turn navigation.</p>
                </div>

                {clinic && (
                  <div className="location-map__embed">
                    <iframe
                      src={mapsEmbedUrl(clinic.coordinates.lat, clinic.coordinates.lng)}
                      title={`Map showing ${SITE_BRAND.full} clinic location`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}

                <div className="location-map__actions">
                  <button
                    type="button"
                    className="btn btn--primary location-map__btn"
                    onClick={openDirections}
                    disabled={!clinic}
                  >
                    <Navigation size={18} aria-hidden />
                    Get directions
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline location-map__btn"
                    onClick={openMapView}
                    disabled={!clinic}
                  >
                    Open in Google Maps
                  </button>
                </div>

                {clinic && (
                  <p className="location-map__coords">
                    GPS: {clinic.coordinates.lat.toFixed(5)}° N, {clinic.coordinates.lng.toFixed(5)}° E
                  </p>
                )}
              </div>
            </section>
          </div>

          <section className="location-tips" aria-labelledby="location-tips-heading">
            <h2 id="location-tips-heading" className="location-tips__heading">
              Getting here
            </h2>
            <div className="location-tips__grid">
              <article className="card location-tips__card">
                <Car size={22} className="location-tips__icon" aria-hidden />
                <h3>By car</h3>
                <p>
                  Use <strong>Get directions</strong> above for GPS navigation to Iriga City,
                  Camarines Sur.
                </p>
              </article>
              <article className="card location-tips__card">
                <Bus size={22} className="location-tips__icon" aria-hidden />
                <h3>Public transport</h3>
                <p>
                  Buses and jeepneys serve Iriga City and the wider Bicol Region. Use the map above
                  for the nearest stop and walking route to the clinic.
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
