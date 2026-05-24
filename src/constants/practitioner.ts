import { SITE_BRAND } from './clinic'

export const PRACTITIONER = {
  name: 'Edgar Bustamante, N.D.',
  title: 'Naturopathy Practitioner',
  image: '/assets/edgar-bustamante.png',
  bio: `Edgar Bustamante, N.D. (Naturopathy Doctor) founded ${SITE_BRAND.full} to offer scientific colon hydrotherapy, iridology, herbology, and natural wellness products. With years of hands-on practice in the Philippines, he guides each patient with safe, drug-free, in-clinic care tailored to holistic healing.`,
  credentials: [
    'Certified Naturopathy Practitioner (N.D.)',
    'Colon hydrotherapy & iridology specialist',
    'Herbal medicine & wellness counseling',
  ],
} as const
