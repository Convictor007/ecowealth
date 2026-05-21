import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface AppointmentModalContextValue {
  isOpen: boolean
  openAppointmentModal: () => void
  closeAppointmentModal: () => void
}

const AppointmentModalContext = createContext<AppointmentModalContextValue | null>(null)

export function AppointmentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openAppointmentModal = useCallback(() => setIsOpen(true), [])
  const closeAppointmentModal = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, openAppointmentModal, closeAppointmentModal }),
    [isOpen, openAppointmentModal, closeAppointmentModal],
  )

  return (
    <AppointmentModalContext.Provider value={value}>{children}</AppointmentModalContext.Provider>
  )
}

export function useAppointmentModal() {
  const ctx = useContext(AppointmentModalContext)
  if (!ctx) {
    throw new Error('useAppointmentModal must be used within AppointmentModalProvider')
  }
  return ctx
}
