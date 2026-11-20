import { createContext } from 'react'

export interface AuthUser {
  id: number
  name: string
  profileComplete: boolean
}

export type AuthStatus = 'loading' | 'anonymous' | 'onboarding' | 'authenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
