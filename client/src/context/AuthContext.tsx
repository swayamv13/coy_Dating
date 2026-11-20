import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'
import { AuthContext } from './auth-context'
import type { AuthStatus, AuthUser } from './auth-context'

interface AuthStateResponse {
  success: boolean
  authenticated: boolean
  profileRequired: boolean
  user?: AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  const refresh = useCallback(async () => {
    const response = await api.get<AuthStateResponse>('/api/auth/state')
    if (response.data.authenticated && response.data.user) {
      setUser(response.data.user)
      setStatus('authenticated')
    } else {
      setUser(null)
      setStatus(response.data.profileRequired ? 'onboarding' : 'anonymous')
    }
  }, [])

  useEffect(() => {
    let active = true
    void api.get<AuthStateResponse>('/api/auth/state')
      .then(({ data }) => {
        if (!active) return
        if (data.authenticated && data.user) {
          setUser(data.user)
          setStatus('authenticated')
        } else {
          setUser(null)
          setStatus(data.profileRequired ? 'onboarding' : 'anonymous')
        }
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        setStatus('anonymous')
      })
    return () => { active = false }
  }, [])

  const signOut = useCallback(async () => {
    await api.post('/api/auth/logout')
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({ status, user, refresh, signOut }),
    [status, user, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
