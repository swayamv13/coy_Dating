import { Check, RotateCcw, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import InterestPicker from '../components/InterestPicker'
import ProfileCard from '../components/ProfileCard'
import {
  getMyProfile,
  removeMyProfilePhoto,
  saveMyProfile,
  uploadMyProfilePhoto,
  type EditableProfile,
} from '../services/profileApi'
import type { Profile } from '../types/Profile'

const availableInterests = [
  'Tech', 'Travel', 'Music', 'Fitness', 'Food', 'Photography',
  'Books', 'Movies', 'Art', 'Sports', 'Cooking', 'Hiking',
  'Dance', 'Fashion', 'Coffee', 'Design', 'Writing', 'Gaming',
]

export function ProfilePage() {
  const [profile, setProfile] = useState<EditableProfile | null>(null)
  const [draft, setDraft] = useState<EditableProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const loaded = await getMyProfile()
      setProfile(loaded)
      setDraft(loaded)
      setPhotoPreview(loaded.photoUrl)
    } catch {
      setError('We could not load your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const fetchProfile = async () => {
      try {
        const loaded = await getMyProfile()
        if (cancelled) return
        setProfile(loaded)
        setDraft(loaded)
        setPhotoPreview(loaded.photoUrl)
      } catch {
        if (!cancelled) setError('We could not load your profile. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchProfile()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(''), 4000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const updateDraft = (field: keyof EditableProfile, value: string | number | string[]) => {
    setDraft((current) => current ? { ...current, [field]: value } : current)
  }

  const handlePhotoSelection = async (file: File | undefined) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setFeedback('Choose a JPEG, PNG, or WebP image.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback('The photo must be 5 MB or smaller.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
    setUploading(true)
    setFeedback('')

    try {
      const updated = await uploadMyProfilePhoto(file)
      setProfile(updated)
      setDraft((current) => (current ? { ...current, photoUrl: updated.photoUrl } : updated))
      setPhotoPreview(updated.photoUrl)
      setFeedback('Photo uploaded successfully.')
    } catch {
      setPhotoPreview(profile?.photoUrl || '')
      setFeedback('The photo could not be uploaded. Please try again.')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = async () => {
    setUploading(true)
    setFeedback('')
    try {
      const updated = await removeMyProfilePhoto()
      setProfile(updated)
      setDraft((current) => (current ? { ...current, photoUrl: updated.photoUrl } : updated))
      setPhotoPreview('')
      setFeedback('Photo removed.')
    } catch {
      setFeedback('The photo could not be removed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft) return

    if (!draft.name.trim() || !draft.location.trim() || !draft.bio.trim()) {
      setFeedback('Name, location, and bio are required.')
      return
    }
    if (draft.age < 18 || draft.age > 99) {
      setFeedback('Age must be between 18 and 99.')
      return
    }

    setSaving(true)
    setFeedback('')
    try {
      const updated = await saveMyProfile({
        name: draft.name.trim(),
        age: draft.age,
        location: draft.location.trim(),
        bio: draft.bio.trim(),
        photoCaption: draft.photoCaption,
        interests: draft.interests,
      })
      setProfile(updated)
      setDraft(updated)
      setFeedback('Profile saved successfully.')
    } catch {
      setFeedback('Your changes could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const previewProfile: Profile | null = draft
    ? {
        id: draft.id,
        name: draft.name || 'Your name',
        age: Number.isFinite(draft.age) ? draft.age : 18,
        location: draft.location || 'Your location',
        bio: draft.bio || 'Your bio will appear here.',
        photoUrl: photoPreview,
        interests: draft.interests,
      }
    : null

  if (loading) {
    return (
      <section className="profile-state" role="status" aria-live="polite">
        Loading your profile...
      </section>
    )
  }

  if (error || !draft) {
    return (
      <section className="profile-state profile-error" role="alert">
        <p>{error || 'Your profile is unavailable.'}</p>
        <button className="coy-button coy-button-secondary" type="button" onClick={() => void loadProfile()}>
          <RotateCcw size={16} aria-hidden="true" />
          Retry
        </button>
      </section>
    )
  }

  return (
    <section className="profile-view" aria-labelledby="profile-title">
      <header className="profile-page-heading">
        <div>
          <h1 id="profile-title">My Profile</h1>
          <p>Edit your details and watch the preview update live.</p>
        </div>
      </header>

      {feedback && (
        <div className="profile-feedback" role="status" aria-live="polite">
          <Check size={15} aria-hidden="true" />
          {feedback}
        </div>
      )}

      <div className="profile-edit-layout">
        <form className="profile-editor" onSubmit={handleSave}>
          <div className="profile-photo-editor">
            <div className="profile-photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Your current profile photo" />
              ) : (
                <span>{draft.name.slice(0, 2).toUpperCase() || 'YO'}</span>
              )}
            </div>
            <div className="profile-photo-actions">
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload profile photo"
                onChange={(event) => void handlePhotoSelection(event.target.files?.[0])}
              />
              <button
                className="coy-button coy-button-primary"
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} aria-hidden="true" />
                {draft.photoUrl ? 'Replace photo' : 'Upload photo'}
              </button>
              {draft.photoUrl && (
                <button
                  className="coy-button coy-button-secondary"
                  type="button"
                  disabled={uploading}
                  onClick={() => void handleRemovePhoto()}
                >
                  <X size={16} aria-hidden="true" />
                  Remove
                </button>
              )}
              <p>JPEG, PNG or WebP. Maximum 5 MB.</p>
            </div>
          </div>

          <label className="profile-field">
            <span>Name <small>{draft.name.length}/35</small></span>
            <input
              value={draft.name}
              maxLength={35}
              onChange={(event) => updateDraft('name', event.target.value)}
            />
          </label>

          <div className="profile-field-row">
            <label className="profile-field">
              <span>Age</span>
              <input
                type="number"
                min={18}
                max={99}
                value={draft.age}
                onChange={(event) => updateDraft('age', Number(event.target.value))}
              />
            </label>
            <label className="profile-field">
              <span>Location <small>{draft.location.length}/45</small></span>
              <input
                value={draft.location}
                maxLength={45}
                onChange={(event) => updateDraft('location', event.target.value)}
              />
            </label>
          </div>

          <label className="profile-field">
            <span>Bio <small>{draft.bio.length}/150</small></span>
            <textarea
              value={draft.bio}
              maxLength={150}
              onChange={(event) => updateDraft('bio', event.target.value)}
            />
          </label>

          <label className="profile-field">
            <span>Photo caption <small>{draft.photoCaption.length}/90</small></span>
            <input
              value={draft.photoCaption}
              maxLength={90}
              onChange={(event) => updateDraft('photoCaption', event.target.value)}
            />
          </label>

          <div className="profile-field">
            <span>Interests <small>{draft.interests.length}/12</small></span>
            <InterestPicker
              interests={availableInterests}
              selected={draft.interests}
              onChange={(interests) => updateDraft('interests', interests)}
            />
          </div>

          <button className="coy-button coy-button-primary profile-save-button" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <aside className="profile-preview-panel" aria-label="Live profile preview">
          <div className="profile-preview-heading">
            <span className="eyebrow">Live preview</span>
            <h2>How others see you</h2>
          </div>
          {previewProfile && <ProfileCard profile={previewProfile} photoCaption={draft.photoCaption} />}
        </aside>
      </div>
    </section>
  )
}
