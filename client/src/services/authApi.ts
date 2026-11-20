import api from './api'
import type { AuthUser } from '../context/auth-context'

export interface ProfileSetupPayload {
  name: string
  age: number
  gender: string
  lookingFor: string[]
  location: string
  bio: string
  interests: string[]
}

interface AuthResponse {
  success: boolean
  profileRequired?: boolean
  user?: AuthUser
  message?: string
}

export async function requestPhoneCode(phoneNumber: string): Promise<string> {
  const response = await api.post<AuthResponse>('/api/auth/request-code', { phoneNumber })
  return response.data.message ?? 'Your local verification code is 12345.'
}

export async function verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean> {
  const response = await api.post<AuthResponse>('/api/auth/verify-code', { phoneNumber, code })
  return Boolean(response.data.profileRequired)
}

export async function completeProfile(payload: ProfileSetupPayload): Promise<AuthUser> {
  const response = await api.post<AuthResponse>('/api/auth/complete-profile', payload)
  if (!response.data.user) throw new Error('The server did not return the new account.')
  return response.data.user
}
