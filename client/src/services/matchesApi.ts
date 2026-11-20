import api from './api'

export interface MatchProfile {
  matchId: number
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
  const response = await api.get<MatchesResponse>('/api/matches')

  return response.data.matches
}

export interface ChatMessage {
  id: number
  senderUserId: number
  body: string
  createdAt: string
}

interface MessagesResponse {
  success: boolean
  messages: ChatMessage[]
}

interface MessageResponse {
  success: boolean
  message: ChatMessage
}

export async function getMessages(matchId: number, afterId?: number): Promise<ChatMessage[]> {
  const response = await api.get<MessagesResponse>(`/api/matches/${matchId}/messages`, {
    params: afterId === undefined ? undefined : { after: afterId },
  })
  return response.data.messages
}

export async function sendMessage(matchId: number, body: string): Promise<ChatMessage> {
  const response = await api.post<MessageResponse>(`/api/matches/${matchId}/messages`, { body })
  return response.data.message
}
