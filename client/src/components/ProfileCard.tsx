import { MapPin } from 'lucide-react'
import { useState } from 'react'
import type { Profile } from '../types/Profile'

interface ProfileCardProps {
  profile: Profile
  photoCaption?: string
}

function ProfileCard({ profile, photoCaption }: ProfileCardProps) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState('')
  const imageFailed = Boolean(profile.photoUrl) && failedPhotoUrl === profile.photoUrl
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <article className="profile-card" aria-label={`${profile.name}, ${profile.age}`}>
      <div className="profile-photo">
        {imageFailed ? (
          <div className="profile-photo-fallback" role="img" aria-label={`${profile.name} profile photo unavailable`}>
            <span>{initials}</span>
          </div>
        ) : profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={`Profile photo of ${profile.name}`}
            onError={() => setFailedPhotoUrl(profile.photoUrl)}
          />
        ) : (
          <div className="profile-photo-fallback" role="img" aria-label={`${profile.name} profile photo unavailable`}>
            <span>{initials}</span>
          </div>
        )}

        {(photoCaption ?? profile.photoCaption)?.trim() && (
          <span className="profile-photo-caption">{photoCaption ?? profile.photoCaption}</span>
        )}
      </div>

      <div className="profile-info">
        <div className="profile-name-row">
          <h2 className="profile-name">{profile.name}</h2>
          <span className="profile-age">{profile.age}</span>
        </div>
        <span className="profile-gender">{profile.gender}</span>

        <p className="profile-location">
          <MapPin size={12} strokeWidth={2.4} aria-hidden="true" />
          {profile.location}
        </p>

        <p className="profile-bio">{profile.bio}</p>

        <ul className="profile-interests" aria-label="Interests">
          {profile.interests.map((interest) => (
            <li className="profile-interest" key={interest}>
              {interest}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default ProfileCard
