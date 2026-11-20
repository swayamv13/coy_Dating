import { MapPin } from 'lucide-react'
import { useState } from 'react'
import type { MatchProfile } from '../services/matchesApi'

interface MatchCardProps {
  match: MatchProfile
}

function MatchCard({ match }: MatchCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = match.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <article className="match-card" aria-label={`Match with ${match.name}`}>
      <div className="match-card-photo">
        {imageFailed ? (
          <div
            className="match-photo-fallback"
            role="img"
            aria-label={`${match.name} profile photo unavailable`}
          >
            {initials}
          </div>
        ) : (
          <img
            src={match.photo}
            alt={`Profile photo of ${match.name}`}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="match-card-info">
        <h2>{match.name}, {match.age}</h2>
        <p className="match-city">
          <MapPin size={12} strokeWidth={2.4} aria-hidden="true" />
          {match.city}
        </p>
        <ul className="match-interests" aria-label="Interests">
          {match.interests.slice(0, 3).map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default MatchCard
