import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import BookAppointmentButton from '@/components/appointment/BookAppointmentButton'
import ContactPractitionerHero from '@/components/contact/ContactPractitionerHero'
import './ContactPage.css'

export default function ContactPage() {
  return (
    <>
      <ContactPractitionerHero />

      <div className="page-shell contact-page__body">
        <div className="container">
          <header className="contact-page__section-head">
            <h2 className="section__title">How to reach us</h2>
            <p className="section__lead">
              Book online, call, or visit our clinic in the Bicol Region. We aim to respond within 24
              hours.
            </p>
          </header>

          <div className="contact-grid">
            <article className="card contact-card">
              <Phone size={28} color="var(--green)" />
              <h3>Phone</h3>
              <p>
                <a href="tel:09516114125">0951 611 4125</a>
              </p>
              <p className="contact-card__sub">
                <a href="tel:09913916469">0991 391 6469</a>
              </p>
              <span>Calls and text messages welcome</span>
            </article>
            <article className="card contact-card">
              <Mail size={28} color="var(--green)" />
              <h3>Appointments</h3>
              <p>Send a request through our online booking form.</p>
              <BookAppointmentButton />
              <span>We aim to respond within 24 hours by phone or email</span>
            </article>
            <Link to="/location" className="card contact-card contact-card--link">
              <MapPin size={28} color="var(--green)" />
              <h3>Visit us</h3>
              <p>ONEWAYHI Clinic</p>
              <p className="contact-card__sub">Bicol Region, Philippines</p>
              <span>Directions and map</span>
            </Link>
            <article className="card contact-card">
              <Clock size={28} color="var(--green)" />
              <h3>Hours</h3>
              <p>Monday – Saturday</p>
              <p className="contact-card__sub">9:00 AM – 6:00 PM</p>
              <span>Sunday by appointment only</span>
            </article>
          </div>
        </div>
      </div>
    </>
  )
}
