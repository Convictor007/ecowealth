import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Phone, Sun, X } from 'lucide-react'
import { BOOKING_CTA, SITE_BRAND } from '@/constants/clinic'
import { NAV_ITEMS } from '@/constants/navigation'
import ClinicLogo from '@/components/shared/ClinicLogo'
import { useAppointmentModal } from '@/context/AppointmentModalContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useTheme } from '@/hooks/useTheme'
import './Header.css'

export default function Header() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { isDark, toggleTheme } = useTheme()
  const { openAppointmentModal } = useAppointmentModal()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const tel = BOOKING_CTA.phone.replace(/\s/g, '')

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path.startsWith('/#')) return location.pathname === '/' && location.hash === path.slice(1)
    return location.pathname === path
  }

  const openBooking = () => {
    setMenuOpen(false)
    openAppointmentModal()
  }

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <div className="container site-header__bar-inner">
          <Link to="/" className="site-header__brand" onClick={() => setMenuOpen(false)}>
            <ClinicLogo size="sm" />
            <div className="site-header__titles">
              <span className="site-header__name">{SITE_BRAND.name}</span>
              <span className="site-header__tag">{SITE_BRAND.tagline}</span>
            </div>
          </Link>

          {!isMobile && (
            <div className="site-header__quick">
              <a href={`tel:${tel}`} className="site-header__phone">
                <Phone size={16} />
                {BOOKING_CTA.phone}
              </a>
              <button type="button" className="btn btn--primary site-header__book" onClick={openBooking}>
                {BOOKING_CTA.label}
              </button>
            </div>
          )}

          <div className="site-header__actions">
            <button type="button" className="site-header__icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isMobile && (
              <button
                type="button"
                className="site-header__icon-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className={`site-header__nav ${menuOpen ? 'site-header__nav--open' : ''}`}>
        <div className="container site-header__nav-inner">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={isActive(item.path) ? 'site-header__link site-header__link--active' : 'site-header__link'}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isMobile && (
            <button type="button" className="btn btn--primary site-header__nav-cta" onClick={openBooking}>
              {BOOKING_CTA.label}
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
