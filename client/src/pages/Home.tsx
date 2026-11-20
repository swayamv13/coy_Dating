import { ArrowRight, Crown, Heart, MessageCircle, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getDiscoverProfiles } from '../services/discoverApi'
import { getMatches, type MatchProfile } from '../services/matchesApi'
import { getTrending, type TrendingInterest } from '../services/trendingApi'

interface HomeOverview {
  matches: MatchProfile[]
  profilesToDiscover: number
  trendingInterests: TrendingInterest[]
}

const emptyOverview: HomeOverview = {
  matches: [],
  profilesToDiscover: 0,
  trendingInterests: [],
}

async function fetchHomeOverview(): Promise<HomeOverview> {
  const [matches, profiles, trending] = await Promise.all([
    getMatches(),
    getDiscoverProfiles(),
    getTrending(),
  ])
  return {
    matches,
    profilesToDiscover: profiles.length,
    trendingInterests: trending.interests,
  }
}

function Home() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(emptyOverview)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setOverview(await fetchHomeOverview())
    } catch {
      setError('We could not load your latest activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchHomeOverview()
      .then((result) => {
        if (active) setOverview(result)
      })
      .catch(() => {
        if (active) setError('We could not load your latest activity. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const recentMatches = overview.matches.slice(0, 4)
  const heroMatches = overview.matches.slice(0, 2)

  return (
    <section className="home-view" aria-labelledby="home-title">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">Discover. Connect. Belong.</span>
          <h1 id="home-title">
            Find someone<br />
            who gets <span>you</span>
          </h1>
          <p>Hi{user?.name ? `, ${user.name}` : ''}. Find someone special, right here.</p>
          <Link className="joy-primary-button" to="/discover">
            Start discovering <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <span className="hero-orbit hero-orbit-one" />
          <span className="hero-orbit hero-orbit-two" />
          {heroMatches.length > 0 ? (
            <div className="hero-photo-stack">
              {heroMatches.map((match, index) => (
                <div className={`hero-photo hero-photo-${index + 1}`} key={match.matchId}>
                  {match.photo ? <img src={match.photo} alt="" /> : <Heart size={38} fill="currentColor" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="hero-heart-art">
              <span className="hero-heart-back"><Heart size={105} fill="currentColor" /></span>
              <span className="hero-heart-front"><Heart size={78} fill="currentColor" /></span>
              <Sparkles className="hero-sparkle hero-sparkle-one" size={22} />
              <Sparkles className="hero-sparkle hero-sparkle-two" size={16} />
            </div>
          )}
        </div>
      </section>

      <section className="home-activity-card" aria-labelledby="activity-title">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">Your little world</span>
            <h2 id="activity-title">Your activity</h2>
          </div>
          <Link className="quiet-link" to="/matches">View matches <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        {error && (
          <div className="home-load-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadOverview()}>Try again</button>
          </div>
        )}
        <div className="home-stats-grid" aria-busy={loading}>
          <Link className="home-stat" to="/matches">
            <span className="home-stat-icon stat-pink"><Heart size={19} fill="currentColor" aria-hidden="true" /></span>
            <span className="home-stat-copy">
              <strong>{loading ? '—' : overview.matches.length}</strong>
              <span>Mutual matches</span>
            </span>
          </Link>
          <Link className="home-stat" to="/discover">
            <span className="home-stat-icon stat-lavender"><Users size={19} aria-hidden="true" /></span>
            <span className="home-stat-copy">
              <strong>{loading ? '—' : overview.profilesToDiscover}</strong>
              <span>People to discover</span>
            </span>
          </Link>
          <Link className="home-stat" to="/trending">
            <span className="home-stat-icon stat-peach"><Sparkles size={19} aria-hidden="true" /></span>
            <span className="home-stat-copy">
              <strong>{loading ? '—' : overview.trendingInterests.length}</strong>
              <span>Trending interests</span>
            </span>
          </Link>
        </div>
      </section>

      <div className="home-content-grid">
        <section className="home-content-card" aria-labelledby="recent-matches-title">
          <div className="home-section-heading">
            <div>
              <span className="eyebrow">Good things are mutual</span>
              <h2 id="recent-matches-title">Recent matches</h2>
            </div>
            <Link className="quiet-link" to="/matches">See all <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          {recentMatches.length ? (
            <div className="home-recent-matches">
              {recentMatches.map((match) => (
                <Link className="home-recent-match" to={`/matches/${match.matchId}`} key={match.matchId}>
                  <span className="home-recent-photo">
                    {match.photo ? <img src={match.photo} alt="" /> : <span>{match.name.slice(0, 1)}</span>}
                    <Heart size={15} fill="currentColor" aria-hidden="true" />
                  </span>
                  <span className="home-recent-name">{match.name}</span>
                  <span className="home-recent-action"><MessageCircle size={14} aria-hidden="true" /> Chat</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home-empty-matches">
              <span className="home-empty-icon"><Heart size={20} aria-hidden="true" /></span>
              <div>
                <strong>Your next connection starts here</strong>
                <p>When you both like each other, you’ll find your match here.</p>
              </div>
              <Link className="quiet-link" to="/discover">Discover <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          )}
        </section>

        <section className="home-content-card home-trends-card" aria-labelledby="home-trends-title">
          <div className="home-section-heading">
            <div>
              <span className="eyebrow">Around the community</span>
              <h2 id="home-trends-title">Trending together</h2>
            </div>
            <Link className="round-link" to="/trending" aria-label="See all trends">
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {overview.trendingInterests.length ? (
            <div className="home-trend-chips">
              {overview.trendingInterests.slice(0, 5).map((interest) => (
                <Link to="/trending" key={interest.name}>{interest.name}</Link>
              ))}
            </div>
          ) : (
            <p className="home-trends-empty">
              {loading ? 'Finding what the community loves…' : 'Shared interests will appear here as the community grows.'}
            </p>
          )}
        </section>
      </div>

      <section className="home-premium-card" aria-label="Joy Plus preview">
        <span className="premium-icon"><Crown size={24} aria-hidden="true" /></span>
        <div>
          <span className="eyebrow">A little more magic</span>
          <h2>Joy Plus is on its way</h2>
          <p>More ways to make meaningful connections are coming soon.</p>
        </div>
        <span className="coming-soon-pill">Coming soon</span>
      </section>
    </section>
  )
}

export default Home
