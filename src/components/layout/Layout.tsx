import { Outlet } from 'react-router-dom'
import AppointmentModal from '@/components/appointment/AppointmentModal'
import { AppointmentModalProvider } from '@/context/AppointmentModalContext'
import Footer from './Footer'
import Header from './Header'
import ScrollToTop from './ScrollToTop'
import ScrollToTopOnNavigate from './ScrollToTopOnNavigate'

export default function Layout() {
  return (
    <AppointmentModalProvider>
      <ScrollToTopOnNavigate />
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <AppointmentModal />
    </AppointmentModalProvider>
  )
}
