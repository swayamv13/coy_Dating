import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/useAuth'

export function RequireAuthentication({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="auth-loading" role="status">Checking your session…</div>
  }
  if (status === 'onboarding') return <Navigate to="/onboarding" replace />
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return <div className="auth-loading" role="status">Checking your session…</div>
  }
  if (status === 'onboarding') return children
  return <Navigate to={status === 'authenticated' ? '/discover' : '/login'} replace />
}
