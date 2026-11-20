import { Compass, Heart, House, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { getMatches } from '../services/matchesApi'

const navigationItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Heart },
  { to: '/profile', label: 'My Profile', icon: UserRound },
]

function ApplicationLayout() {
  const location = useLocation()
  const [matchCount, setMatchCount] = useState(0)

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
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="Coy Discover home">
          coy<span>.</span>
        </NavLink>

        <div className="topbar-actions">
          <span className="demo-pill">INTERACTIVE DEMO · FICTIONAL PROFILES</span>
          <NavLink className="account-avatar" to="/profile" aria-label="Open My Profile" title="Open My Profile">
            S
          </NavLink>
        </div>
      </header>

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
            <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>{label}</span>
            {to === '/matches' && matchCount > 0 && (
              <span className="nav-match-count" aria-label={`${matchCount} matches`}>
                {matchCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer" aria-label="Application information">
        <span>Private by design</span>
        <span>Smooth swipe experience</span>
        <span>Persistent demo data</span>
        <span>Responsive layouts</span>
        <span>Coy-inspired UI</span>
      </footer>
    </div>
  )
}

export default ApplicationLayout
