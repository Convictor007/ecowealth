import { apiGet } from './client'
import { resolvePhpApiBase, useMysqlApi } from './config'
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

const JSON_BASE = '/api'

function jsonPath(file: string) {
  return `${JSON_BASE}/${file}`
}

function mysqlPath(endpoint: string) {
  return `${resolvePhpApiBase()}/${endpoint}.php`
}

export function getClinicInfo() {
  if (useMysqlApi()) {
    return apiGet<ClinicInfo>(mysqlPath('clinic'))
  }
  return apiGet<ClinicInfo>(jsonPath('clinic.json'))
}

export function getHeroSlides() {
  return apiGet<HeroSlide[]>(jsonPath('slides.json'))
}

export function getProducts() {
  if (useMysqlApi()) {
    return apiGet<Product[]>(mysqlPath('products'))
  }
  return apiGet<Product[]>(jsonPath('products.json'))
}

export function getServices() {
  return apiGet<Service[]>(jsonPath('services.json'))
}

export function getColonicsConditions() {
  return apiGet<ColonicsConditions>(jsonPath('colonics-conditions.json'))
}

export function getColonicsMedia() {
  return apiGet<ColonicsMedia>(jsonPath('colonics-media.json'))
}

export function getColonEducation() {
  return apiGet<ColonEducationContent>(jsonPath('colon-education.json'))
}

export function getWellnessMassage() {
  return apiGet<WellnessMassageContent>(jsonPath('wellness-massage.json'))
}
