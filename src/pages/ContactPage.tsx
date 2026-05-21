import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import BookAppointmentButton from '@/components/appointment/BookAppointmentButton'
import PageHero from '@/components/shared/PageHero'
import PractitionerIntro from '@/components/shared/PractitionerIntro'
import './ContactPage.css'

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact the clinic"
        description="Schedule appointments, ask about treatments, or inquire about products available in-clinic."
      />
      <div className="page-shell">
        <div className="container">
          <PractitionerIntro />

          <div className="contact-grid">
            <article className="card contact-card">
              <Phone size={28} color="var(--green)" />
              <h3>Phone</h3>
              <p><a href="tel:09516114125">0951 611 4125</a></p>
              <p className="contact-card__sub"><a href="tel:09913916469">0991 391 6469</a></p>
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
          <div className="contact-booking-note">
            <p>
              Schedule a free check-up, iridology consultation, or colon hydrotherapy. We will
              confirm your visit by email or phone.
            </p>
            <BookAppointmentButton />
          </div>
        </div>
      </div>
    </>
  )
}
