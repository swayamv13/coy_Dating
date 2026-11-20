import api from './api'
import type { Profile } from '../types/Profile'

interface DiscoverResponse {
  success: boolean
  profiles: Profile[]
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
    },
  )

  return response.data.profiles
}

export async function submitSwipe(
  targetUserId: number,
  action: 'like' | 'pass',
): Promise<SwipeResponse> {
  const response = await api.post<SwipeResponse>(
    '/api/swipes',
    { targetUserId, action },
  )

  return response.data
}
