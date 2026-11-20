import { Compass, Crown, Heart, House, LogOut, TrendingUp, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/useAuth'
import { getMatches } from '../services/matchesApi'

const navigationItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Heart },
  { to: '/trending', label: 'Trends', icon: TrendingUp },
  { to: '/profile', label: 'My Profile', icon: UserRound },
]

function ApplicationLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [matchCount, setMatchCount] = useState(0)
  const [logoutError, setLogoutError] = useState('')

  const handleSignOut = async () => {
    setLogoutError('')
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Sign out failed. Please try again.')
    }
  }

  useEffect(() => {
    const refreshMatchCount = async () => {
      try {
        const matches = await getMatches()
        setMatchCount(matches.length)
      } catch {
        setMatchCount(0)
      }
    }

    void refreshMatchCount()
  }, [location.pathname])

  useEffect(() => {
    const refreshMatchCount = () => {
      void getMatches()
        .then((matches) => setMatchCount(matches.length))
        .catch(() => undefined)
    }

    window.addEventListener('coy:matches-changed', refreshMatchCount)
    return () => window.removeEventListener('coy:matches-changed', refreshMatchCount)
  }, [])

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink className="brand" to="/" aria-label="Joy home">
          <BrandLogo />
        </NavLink>
        <p className="brand-tagline">Discover. Connect. Belong.</p>

        <nav className="main-nav" aria-label="Primary navigation">
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item${isActive ? ' nav-item-active' : ''}`
              }
            >
              <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
              <span>{label}</span>
              {to === '/matches' && matchCount > 0 && (
                <span className="nav-match-count" aria-label={`${matchCount} matches`}>
                  {matchCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <section className="sidebar-premium" aria-label="Joy Plus">
          <span className="sidebar-premium-icon"><Crown size={18} aria-hidden="true" /></span>
          <strong>Joy Plus</strong>
          <p>A little extra magic is on its way.</p>
          <span className="coming-soon-pill">Coming soon</span>
        </section>

        <div className="sidebar-user">
          <NavLink className="account-avatar" to="/profile" aria-label="Open My Profile" title="Open My Profile">
            {user?.name.slice(0, 1).toUpperCase() || 'U'}
          </NavLink>
          <span className="sidebar-user-name">{user?.name || 'Your profile'}</span>
          <button
            className="sign-out-button"
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => void handleSignOut()}
          >
            <LogOut size={15} aria-hidden="true" />
          </button>
        </div>

      </aside>

      <div className="app-main">
        <header className="topbar">
          <NavLink className="mobile-brand" to="/" aria-label="Joy home">
            <BrandLogo />
          </NavLink>
          <p className="topbar-welcome">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </p>
          <button
            className="topbar-sign-out"
            type="button"
            aria-label="Sign out"
            onClick={() => void handleSignOut()}
          >
            <LogOut size={17} aria-hidden="true" />
          </button>
        </header>

        {logoutError && <p className="layout-error" role="alert">{logoutError}</p>}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ApplicationLayout
