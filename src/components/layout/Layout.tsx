import { Outlet } from 'react-router-dom'
import AppointmentModal from '@/components/appointment/AppointmentModal'
import { AppointmentModalProvider } from '@/context/AppointmentModalContext'
import Footer from './Footer'
import Header from './Header'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <AppointmentModalProvider>
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
