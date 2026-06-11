import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { CLINIC_PHONES, SITE_BRAND } from '@/constants/clinic'
import './Footer.css'

const FOOTER_SERVICES = [
  { label: 'Colon hydrotherapy', path: '/services' },
  { label: 'Therapeutic massage', path: '/services' },
  { label: 'Iridology assessment', path: '/services' },
  { label: 'Herbal consultation', path: '/services' },
  { label: 'Wellness products', path: '/products' },
] as const

const FOOTER_CLINIC = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/#about' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Location', path: '/location' },
  { label: 'Contact', path: '/contact' },
] as const

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__columns">
        <div className="site-footer__col">
          <h3>Get in touch</h3>
          <ul className="site-footer__contact">
            <li>
              <Phone size={18} aria-hidden />
              <div>
                <span>Call us</span>
                <a href={`tel:${CLINIC_PHONES.primary.replace(/\s/g, '')}`}>{CLINIC_PHONES.primary}</a>
                <a href={`tel:${CLINIC_PHONES.secondary.replace(/\s/g, '')}`}>{CLINIC_PHONES.secondary}</a>
              </div>
            </li>
            <li>
              <Mail size={18} aria-hidden />
              <div>
                <span>Appointments</span>
                <Link to="/contact">Book online</Link>
              </div>
            </li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h3>Services</h3>
          <ul>
            {FOOTER_SERVICES.map((item) => (
              <li key={item.label}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h3>Clinic</h3>
          <ul>
            {FOOTER_CLINIC.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h3>Office hours</h3>
          <ul className="site-footer__hours">
            <li>
              <Clock size={18} aria-hidden />
              <div>
                <span>Monday – Saturday</span>
                <p>9:00 AM – 6:00 PM</p>
              </div>
            </li>
            <li>
              <MapPin size={18} aria-hidden />
              <div>
                <span>Location</span>
                <p>Bicol Region, Philippines</p>
                <Link to="/location">Directions &amp; map</Link>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__social-bar">
        <div className="container site-footer__social-inner">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="site-footer__fb"
          >
            f
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container">
          <p>
            Copyright © {new Date().getFullYear()} {SITE_BRAND.full}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
