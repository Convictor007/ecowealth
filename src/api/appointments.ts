import { apiGet, apiPost, ApiError } from './client'
import { resolvePhpApiBase, useMysqlApi } from './config'
import type {
  AppointmentRequest,
  AppointmentResponse,
  AppointmentServicesResponse,
} from './types'

const JSON_API = '/api'

export function getAppointmentServices() {
  if (useMysqlApi()) {
    return apiGet<AppointmentServicesResponse>(`${resolvePhpApiBase()}/appointment-services.php`)
  }
  return apiGet<AppointmentServicesResponse>(`${JSON_API}/appointment-services.json`)
}

export function submitAppointment(
  payload: AppointmentRequest,
  apiUrl: string,
): Promise<AppointmentResponse> {
  return apiPost<AppointmentResponse>(apiUrl, payload)
}

export function getAppointmentErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.data && typeof error.data === 'object') {
    const data = error.data as { errors?: Record<string, string> }
    if (data.errors) return data.errors
  }
  return {}
}
