import api from './api'

export interface TrendingInterest {
  name: string
  likes: number
}

export interface TrendingResponse {
  interests: TrendingInterest[]
  prompts: string[]
  windowDays: number
}

export async function getTrending(): Promise<TrendingResponse> {
  const response = await api.get<{ success: boolean } & TrendingResponse>('/api/trending')
  return response.data
}
