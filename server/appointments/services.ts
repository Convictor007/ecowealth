export const APPOINTMENT_SERVICES = [
  { id: 'free-checkup', label: 'Free check-up / consultation' },
  { id: 'colon-hydrotherapy', label: 'Colon hydrotherapy' },
  { id: 'wellness-massage', label: 'Therapeutic massage & wellness' },
  { id: 'iridology', label: 'Iridology' },
  { id: 'herbology', label: 'Herbology' },
  { id: 'herbal-coffee', label: 'Herbal coffee' },
  { id: 'supplements', label: 'Food supplements' },
  { id: 'general-consultation', label: 'General wellness consultation' },
  { id: 'products-inquiry', label: 'Products inquiry (in-clinic)' },
] as const

export const ALLOWED_SERVICE_IDS = [
  'free-checkup',
  'colon-hydrotherapy',
  'wellness-massage',
  'iridology',
  'herbology',
  'herbal-coffee',
  'supplements',
  'general-consultation',
  'products-inquiry',
] as const

export function serviceLabel(id: string): string {
  return APPOINTMENT_SERVICES.find((s) => s.id === id)?.label ?? id
}
