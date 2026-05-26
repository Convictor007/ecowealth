import { apiGet } from './client'
import type {
  ClinicInfo,
  ColonEducationContent,
  ColonicsConditions,
  ColonicsMedia,
  HeroSlide,
  Product,
  Service,
  WellnessMassageContent,
} from './types'

const API_BASE = '/api'

export function getClinicInfo() {
  return apiGet<ClinicInfo>(`${API_BASE}/clinic.json`)
}

export function getHeroSlides() {
  return apiGet<HeroSlide[]>(`${API_BASE}/slides.json`)
}

export function getProducts() {
  return apiGet<Product[]>(`${API_BASE}/products.json`)
}

export function getServices() {
  return apiGet<Service[]>(`${API_BASE}/services.json`)
}

export function getColonicsConditions() {
  return apiGet<ColonicsConditions>(`${API_BASE}/colonics-conditions.json`)
}

export function getColonicsMedia() {
  return apiGet<ColonicsMedia>(`${API_BASE}/colonics-media.json`)
}

export function getColonEducation() {
  return apiGet<ColonEducationContent>(`${API_BASE}/colon-education.json`)
}

export function getWellnessMassage() {
  return apiGet<WellnessMassageContent>(`${API_BASE}/wellness-massage.json`)
}
