import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ApplicationLayout from '../layout/ApplicationLayout'
import { RequireAuthentication, RequireOnboarding } from './RouteGuards'

const Conversation = lazy(() => import('../pages/Conversation'))
const Discover = lazy(() => import('../pages/Discover'))
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Matches = lazy(() => import('../pages/Matches'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Onboarding = lazy(() => import('../pages/Onboarding'))
const ProfilePage = lazy(() => import('../pages/Profile').then((module) => ({ default: module.ProfilePage })))
const Trending = lazy(() => import('../pages/Trending'))

function AppRouter() {
  const { status } = useAuth()

  return (
    <Suspense fallback={<div className="auth-loading" role="status">Loading Joy…</div>}>
      <Routes>
        <Route
          path="/login"
          element={
            status === 'loading' ? <div className="auth-loading" role="status">Checking your session…</div> :
            status === 'authenticated' ? <Navigate to="/discover" replace /> :
            status === 'onboarding' ? <Navigate to="/onboarding" replace /> :
            <Login />
          }
        />
        <Route path="/onboarding" element={
          <RequireOnboarding>
            <Onboarding />
          </RequireOnboarding>
        } />
        <Route element={
          <RequireAuthentication>
            <ApplicationLayout />
          </RequireAuthentication>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:matchId" element={<Conversation />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRouter
