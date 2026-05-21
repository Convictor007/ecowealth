export interface ClinicInfo {
  name: string
  founder: string
  founderTitle: string
  founderImage: string
  founderBio: string
  founderCredentials: string[]
  tagline: string
  phones: string[]
  website: string
  address: {
    primary: string
    clinic: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  hours: {
    weekdays: string
    time: string
    note: string
  }
}

export interface HeroSlide {
  id: number
  title: string
  subtitle: string
  description: string
  services: string
  location: string
  gps: string
  phone: string
  badge: string
  image: string
}

export interface Product {
  id: number
  name: string
  category: string
  price: string
  description: string
  benefits: string[]
  available: boolean
  image: string
}

export interface Service {
  id: string
  icon: string
  title: string
  description: string
  benefits: string[]
}

export interface WellnessMassageContent {
  title: string
  subtitle: string
  description: string
  image: {
    src: string
    alt: string
  }
  benefits: string[]
  note?: string
}

export interface ColonicsConditions {
  leftColumn: string[]
  rightColumn: string[]
}

export interface ColonicsMediaItem {
  src: string
  alt: string
  label?: string
  caption?: string
}

export interface ColonicsMedia {
  machine: ColonicsMediaItem
  before: ColonicsMediaItem
  after: ColonicsMediaItem
  poster?: ColonicsMediaItem
  imageCredit?: string
}

export interface AppointmentService {
  id: string
  label: string
}

export interface AppointmentServicesResponse {
  services: AppointmentService[]
}

export interface AppointmentRequest {
  fullName: string
  phone: string
  email: string
  service: string
  preferredDate?: string
  preferredTime?: string
  notes?: string
  website?: string
}

export interface AppointmentResponse {
  success: boolean
  message: string
  emailSent?: boolean
  referenceId?: string
  errors?: Record<string, string>
}

