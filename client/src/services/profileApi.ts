import api from './api'
import type { Profile } from '../types/Profile'

export interface EditableProfile extends Profile {
  photoCaption: string
  lookingFor: string[]
}

export interface EditableProfilePayload {
  name: string
  age: number
  gender: string
  lookingFor: string[]
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
    gender: string
    lookingFor: string[]
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
  const baseUrl = String(api.defaults.baseURL || '').replace(/\/$/, '')
  const relativeUrl = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`
  return baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl
}

function mapProfile(profile: ProfileResponse['profile']): EditableProfile {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    lookingFor: profile.lookingFor,
    location: profile.location,
    bio: profile.bio,
    photoUrl: withServerBase(profile.photoUrl),
    photoCaption: profile.photoCaption,
    interests: profile.interests,
  }
}

export async function getMyProfile(): Promise<EditableProfile> {
  const response = await api.get<ProfileResponse>('/api/profile')
  return mapProfile(response.data.profile)
}

export async function saveMyProfile(payload: EditableProfilePayload): Promise<EditableProfile> {
  const response = await api.put<ProfileResponse>('/api/profile', payload)
  return mapProfile(response.data.profile)
}

export async function uploadMyProfilePhoto(file: File): Promise<EditableProfile> {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await api.post<ProfileResponse>('/api/profile/photo', formData, {
    headers: { 'Content-Type': undefined },
  })
  return mapProfile(response.data.profile)
}

export async function removeMyProfilePhoto(): Promise<EditableProfile> {
  const response = await api.delete<ProfileResponse>('/api/profile/photo')
  return mapProfile(response.data.profile)
}
