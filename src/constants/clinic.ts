export const SITE_BRAND = {
  name: 'ECO-WEALTH',
  tagline: 'Medical Equipment Manufacturing',
  full: 'ECO-WEALTH Medical Equipment Manufacturing',
} as const

export const CLINIC_PHONES = {
  primary: '0919 861 3002',
  secondary: '0991 391 6469',
} as const

/** Primary booking action — opens secure online booking */
export const BOOKING_CTA = {
  label: 'Book free check-up',
  phone: CLINIC_PHONES.primary,
} as const
