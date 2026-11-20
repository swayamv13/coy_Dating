import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MatchCard from '../components/MatchCard'
import { getMatches, type MatchProfile } from '../services/matchesApi'

function Matches() {
  const [matches, setMatches] = useState<MatchProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMatches = async () => {
    setLoading(true)
    setError('')

    try {
      setMatches(await getMatches())
    } catch {
      setError('We could not load your matches. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const fetchMatches = async () => {
      try {
        const result = await getMatches()
        if (!cancelled) setMatches(result)
      } catch {
        if (!cancelled) setError('We could not load your matches. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchMatches()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="matches-view" aria-labelledby="matches-title">
      <header className="matches-heading">
        <div>
          <span className="eyebrow">The feeling is mutual</span>
          <h1 id="matches-title">Your matches</h1>
          <p>Good connections start with a hello.</p>
        </div>
        {!loading && !error && (
          <span className="match-count-pill">
            {matches.length} MATCH{matches.length === 1 ? '' : 'ES'}
          </span>
        )}
      </header>

      {loading ? (
        <div className="matches-state" role="status" aria-live="polite">
          Loading matches...
        </div>
      ) : error ? (
        <div className="matches-state matches-error" role="alert">
          <p>{error}</p>
          <button className="retry-button" type="button" onClick={() => void loadMatches()}>
            <RotateCcw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="matches-empty">
          <div className="empty-icon" aria-hidden="true">♡</div>
          <h2>No matches yet</h2>
          <p>Like someone you're into. They'll appear here only if it's mutual.</p>
          <Link className="coy-button coy-button-primary empty-action" to="/discover">
            Discover people
          </Link>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Matches
