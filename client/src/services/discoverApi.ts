import api from './api'
import type { Profile } from '../types/Profile'

export const TEMP_TEST_USER_ID = 1

interface DiscoverProfileResponse {
  id: number
  name: string
  age: number
  location: string
  bio: string
  photoUrl: string
  interests: string[]
}

interface DiscoverResponse {
  success: boolean
  profiles: DiscoverProfileResponse[]
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
  }
}

export interface SwipeResponse {
  success: boolean
  swiped: boolean
  action: 'like' | 'pass'
  targetUserId: number
  mutualMatchCreated: boolean
  matchId: number | null
}

export async function getDiscoverProfiles(): Promise<Profile[]> {
  const response = await api.get<DiscoverResponse>(
    '/api/discover',
    {
      params: { limit: 30, offset: 0 },
      headers: { 'x-user-id': TEMP_TEST_USER_ID },
    },
  )

  return response.data.profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    age: profile.age,
    location: profile.location,
    bio: profile.bio,
    interests: profile.interests,
    photoUrl: profile.photoUrl,
  }))
}

export async function submitSwipe(
  targetUserId: number,
  action: 'like' | 'pass',
): Promise<SwipeResponse> {
  const response = await api.post<SwipeResponse>(
    '/api/swipes',
    { targetUserId, action },
    { headers: { 'x-user-id': TEMP_TEST_USER_ID } },
  )

  return response.data
}
