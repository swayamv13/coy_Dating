import { Flame, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTrending, type TrendingResponse } from '../services/trendingApi'

function Trending() {
  const [trending, setTrending] = useState<TrendingResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getTrending()
      .then((result) => {
        if (active) setTrending(result)
      })
      .catch(() => {
        if (active) setError('We could not load community trends. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const handleRetry = async () => {
    setLoading(true)
    setError('')
    try {
      setTrending(await getTrending())
    } catch {
      setError('We could not load community trends. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="trending-view" aria-labelledby="trending-title">
      <header className="trending-heading">
        <span className="eyebrow"><Flame size={14} aria-hidden="true" /> Community pulse</span>
        <h1 id="trending-title">Trends</h1>
        <p>See what’s bringing people together lately.</p>
      </header>

      {loading ? (
        <div className="trending-state" role="status">Finding the community pulse…</div>
      ) : error ? (
        <div className="trending-state trending-error" role="alert">
          <p>{error}</p>
          <button className="retry-button" type="button" onClick={handleRetry}>
            <RotateCcw size={16} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : (
        <div className="trending-grid">
          <section className="trending-panel" aria-labelledby="interests-title">
            <div className="trending-panel-heading">
              <div>
                <span className="eyebrow">Last {trending?.windowDays ?? 7} days</span>
                <h2 id="interests-title">Trending interests</h2>
              </div>
              <Flame size={21} aria-hidden="true" />
            </div>
            {trending?.interests.length ? (
              <ol className="trending-interest-list">
                {trending.interests.map((interest) => (
                  <li key={interest.name}>
                    <span className="trend-interest-icon"><Sparkles size={16} aria-hidden="true" /></span>
                    <span className="trend-interest-copy">
                      <span className="trend-interest-name">{interest.name}</span>
                      <span className="trend-like-count">{interest.likes} recent likes</span>
                    </span>
                    <span className="trend-like-count trend-interest-total">{interest.likes}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="trending-empty">
                <Sparkles size={21} aria-hidden="true" />
                <h3>Good things take a little time</h3>
                <p>Trends appear after at least three members like profiles with the same interests.</p>
                <Link className="coy-button coy-button-secondary" to="/discover">Explore profiles</Link>
              </div>
            )}
          </section>

          <section className="trending-panel prompt-panel" aria-labelledby="prompts-title">
            <span className="eyebrow">A little inspiration</span>
            <h2 id="prompts-title">Conversation starters</h2>
            <p>Pick a thoughtful question to start your next conversation.</p>
            <ul className="conversation-prompt-list">
              {trending?.prompts.map((prompt) => (
                <li key={prompt}><Sparkles size={15} aria-hidden="true" /><span>{prompt}</span></li>
              ))}
            </ul>
            <Link className="coy-button coy-button-primary" to="/matches">Start a conversation</Link>
          </section>
        </div>
      )}
    </section>
  )
}

export default Trending
