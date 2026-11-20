import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Check, Heart, LockKeyhole, RotateCcw, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileCard from '../components/ProfileCard'
import { getDiscoverProfiles, submitSwipe } from '../services/discoverApi'
import type { Profile } from '../types/Profile'

function Discover() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const processingRef = useRef(false)
  const dragX = useMotionValue(0)
  const likeStampOpacity = useTransform(dragX, [20, 100], [0, 1])
  const passStampOpacity = useTransform(dragX, [-100, -20], [1, 0])
  const cardRotation = useTransform(dragX, [-120, 0, 120], [-12, 0, 12])
  const [initialAvailableCount, setInitialAvailableCount] = useState(0)

  const loadProfiles = async () => {
    setLoading(true)
    setError('')

    try {
      const discoveredProfiles = await getDiscoverProfiles()
      setProfiles(discoveredProfiles)
      setInitialAvailableCount(discoveredProfiles.length)
    } catch {
      setError('We could not load Discover profiles. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const fetchProfiles = async () => {
      try {
        const discoveredProfiles = await getDiscoverProfiles()
        if (cancelled) return
        setProfiles(discoveredProfiles)
        setInitialAvailableCount(discoveredProfiles.length)
      } catch {
        if (!cancelled) setError('We could not load Discover profiles. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchProfiles()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(''), 3200)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const currentProfile = profiles[0]
  const exploredThisSession = initialAvailableCount - profiles.length
  const progressPercent = initialAvailableCount
    ? Math.min(100, (exploredThisSession / initialAvailableCount) * 100)
    : 0

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (!currentProfile || processingRef.current) return

    processingRef.current = true
    setProcessing(true)
    setFeedback('')

    try {
      const result = await submitSwipe(currentProfile.id, action)

      if (result.mutualMatchCreated) {
        setFeedback(`It's a match with ${currentProfile.name}!`)
        window.dispatchEvent(new Event('coy:matches-changed'))
      } else if (action === 'like') {
        setFeedback(`Like sent to ${currentProfile.name}`)
      } else {
        setFeedback(`Passed on ${currentProfile.name}`)
      }

      setProfiles((currentProfiles) => currentProfiles.slice(1))
      dragX.set(0)
    } catch {
      setFeedback('This action could not be saved. The profile is still available.')
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } },
  ) => {
    if (info.offset.x > 90) {
      void handleSwipe('like')
    } else if (info.offset.x < -90) {
      void handleSwipe('pass')
    }
  }

  return (
    <section className="discover-view" aria-labelledby="discover-title">
      <header className="discover-heading">
        <h1 id="discover-title">Discover your people.</h1>
        <p>Swipe in secret. Match when it’s mutual.</p>
      </header>

      {feedback && (
        <div className="swipe-feedback" role="status" aria-live="polite">
          <Check size={15} aria-hidden="true" />
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="discover-state" role="status" aria-live="polite">
          <span className="loading-dot" aria-hidden="true" />
          Loading profiles...
        </div>
      ) : error ? (
        <div className="discover-state discover-error" role="alert">
          <p>{error}</p>
          <button className="retry-button" type="button" onClick={() => void loadProfiles()}>
            <RotateCcw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : !currentProfile ? (
        <div className="discover-empty">
          <div className="empty-icon" aria-hidden="true">
            <Heart size={24} />
          </div>
          <h2>You’re all caught up</h2>
          <p>There are no more profiles available right now.</p>
          <Link className="coy-button coy-button-primary empty-action" to="/matches">
            See your matches
          </Link>
        </div>
      ) : (
        <div className="discover-grid">
          <section className="deck-area" aria-label="Profile discovery">
            <motion.div
              key={currentProfile.id}
              className="profile-card-motion"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.75}
              style={{ x: dragX, rotate: cardRotation }}
              onDragStart={() => dragX.set(0)}
              onDragEnd={handleDragEnd}
            >
              <motion.span className="swipe-stamp swipe-stamp-like" style={{ opacity: likeStampOpacity }}>
                LIKE
              </motion.span>
              <motion.span className="swipe-stamp swipe-stamp-pass" style={{ opacity: passStampOpacity }}>
                PASS
              </motion.span>
              <ProfileCard profile={currentProfile} />
            </motion.div>

            <div className="swipe-controls" aria-label="Profile actions">
              <button
                className="swipe-button swipe-pass"
                type="button"
                aria-label={`Pass on ${currentProfile.name}`}
                disabled={processing}
                onClick={() => void handleSwipe('pass')}
              >
                <X size={25} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <button
                className="swipe-button swipe-like"
                type="button"
                aria-label={`Like ${currentProfile.name}`}
                disabled={processing}
                onClick={() => void handleSwipe('like')}
              >
                <Heart size={25} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </div>
            <p className="swipe-hint">Drag the card left or right, or tap a button</p>
          </section>

          <aside className="discover-side" aria-label="Discovery information">
            <section className="discover-panel privacy-panel">
              <LockKeyhole size={20} strokeWidth={2.2} aria-hidden="true" />
              <h2>Your likes stay private</h2>
              <p>People never know you liked them unless they like you back. Only mutual likes become matches.</p>
            </section>

            <section className="discover-panel">
              <div className="discovery-progress-heading">
                <h2>Discovery progress</h2>
                <span>{exploredThisSession} / {initialAvailableCount} explored</span>
              </div>
              <div
                className="discovery-progress"
                role="progressbar"
                aria-label="Profiles explored this session"
                aria-valuemin={0}
                aria-valuemax={initialAvailableCount}
                aria-valuenow={exploredThisSession}
              >
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="how-row">
                <span className="how-icon"><Heart size={13} aria-hidden="true" /></span>
                Swipe right to like
              </div>
              <div className="how-row">
                <span className="how-icon peach"><X size={13} aria-hidden="true" /></span>
                Swipe left to pass
              </div>
              <div className="how-row">
                <span className="how-icon gold"><Sparkles size={13} aria-hidden="true" /></span>
                Match when it’s mutual
              </div>
            </section>
          </aside>
        </div>
      )}
    </section>
  )
}

export default Discover
