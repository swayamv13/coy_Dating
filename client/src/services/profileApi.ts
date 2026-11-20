import api from './api'
import type { Profile } from '../types/Profile'

export const TEMP_TEST_USER_ID = 1

export interface EditableProfile extends Profile {
  photoCaption: string
}

export interface EditableProfilePayload {
  name: string
  age: number
  location: string
  bio: string
  photoCaption: string
  interests: string[]
}

interface ProfileResponse {
  success: boolean
  profile: {
    id: number
    name: string
    age: number
    location: string
    bio: string
    photoUrl: string
    photoCaption: string
    interests: string[]
  }
}

function withServerBase(photoUrl: string): string {
  if (!photoUrl) return ''
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl
  const baseUrl = String(api.defaults.baseURL || 'http://localhost:5000').replace(/\/$/, '')
  return `${baseUrl}${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`
}

function mapProfile(profile: ProfileResponse['profile']): EditableProfile {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    location: profile.location,
    bio: profile.bio,
    photoUrl: withServerBase(profile.photoUrl),
    photoCaption: profile.photoCaption,
    interests: profile.interests,
  }
}

export async function getMyProfile(): Promise<EditableProfile> {
  const response = await api.get<ProfileResponse>('/api/profile', {
    headers: { 'x-user-id': TEMP_TEST_USER_ID },
  })
  return mapProfile(response.data.profile)
}

export async function saveMyProfile(payload: EditableProfilePayload): Promise<EditableProfile> {
  const response = await api.put<ProfileResponse>('/api/profile', payload, {
    headers: { 'x-user-id': TEMP_TEST_USER_ID },
  })
  return mapProfile(response.data.profile)
}

export async function uploadMyProfilePhoto(file: File): Promise<EditableProfile> {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await api.post<ProfileResponse>('/api/profile/photo', formData, {
    headers: {
      'x-user-id': TEMP_TEST_USER_ID,
      'Content-Type': 'multipart/form-data',
    },
  })
  return mapProfile(response.data.profile)
}

export async function removeMyProfilePhoto(): Promise<EditableProfile> {
  const response = await api.delete<ProfileResponse>('/api/profile/photo', {
    headers: { 'x-user-id': TEMP_TEST_USER_ID },
  })
  return mapProfile(response.data.profile)
}
