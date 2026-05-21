/** Service ids allowed for booking (keep in sync with public/api/appointment-services.json). */
export const SERVICE_LABELS: Record<string, string> = {
  'free-checkup': 'Free check-up / consultation',
  'colon-hydrotherapy': 'Colon hydrotherapy',
  'wellness-massage': 'Therapeutic massage & wellness',
  iridology: 'Iridology',
  herbology: 'Herbology',
  'herbal-coffee': 'Herbal coffee',
  supplements: 'Food supplements',
  'general-consultation': 'General wellness consultation',
  'products-inquiry': 'Products inquiry (in-clinic)',
}

export function serviceLabel(id: string): string {
  return SERVICE_LABELS[id] ?? id
}

export function allowedServiceIds(): string[] {
  return Object.keys(SERVICE_LABELS)
}
