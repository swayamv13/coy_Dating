import api from './api'
import { TEMP_TEST_USER_ID } from './discoverApi'

export interface MatchProfile {
  id: number
  name: string
  age: number
  photo: string
  city: string
  bio: string
  interests: string[]
  matchedAt: string
}

interface MatchesResponse {
  success: boolean
  matches: MatchProfile[]
}

export async function getMatches(): Promise<MatchProfile[]> {
  const response = await api.get<MatchesResponse>(
    '/api/matches',
    { headers: { 'x-user-id': TEMP_TEST_USER_ID } },
  )

  return response.data.matches
}
