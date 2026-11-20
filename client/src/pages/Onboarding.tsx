import { ArrowRight, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import InterestPicker from '../components/InterestPicker'
import { useAuth } from '../context/useAuth'
import { completeProfile } from '../services/authApi'

const interestOptions = [
  'Music', 'Travel', 'Food', 'Fitness', 'Books', 'Movies',
  'Art', 'Sports', 'Cooking', 'Hiking', 'Photography', 'Coffee',
  'Design', 'Gaming', 'Nature', 'Dance', 'Wellness', 'Comedy',
]
const preferenceOptions = ['Men', 'Women', 'Non-binary', 'Self-describe', 'Everyone']

function Onboarding() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [selfDescribedGender, setSelfDescribedGender] = useState('')
  const [lookingFor, setLookingFor] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const togglePreference = (preference: string) => {
    if (preference === 'Everyone') {
      setLookingFor(['Everyone'])
      return
    }
    setLookingFor((current) => {
      const selected = current.filter((value) => value !== 'Everyone')
      return selected.includes(preference)
        ? selected.filter((value) => value !== preference)
        : [...selected, preference]
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const profileGender = gender === 'Self-describe' ? selfDescribedGender.trim() : gender
    if (!profileGender) {
      setError('Choose or describe your gender.')
      return
    }
    if (lookingFor.length === 0) {
      setError('Choose who you would like to discover.')
      return
    }
    if (interests.length === 0) {
      setError('Choose at least one interest to help us make thoughtful matches.')
      return
    }

    setBusy(true)
    setError('')
    try {
      await completeProfile({
        name: name.trim(),
        age: Number(age),
        gender: profileGender,
        lookingFor,
        location: location.trim(),
        bio: bio.trim(),
        interests,
      })
      await refresh()
      navigate('/discover', { replace: true })
    } catch {
      setError('We could not save your profile. Check your details and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <Link className="brand" to="/" aria-label="Joy home"><BrandLogo /></Link>
        <span className="eyebrow"><Sparkles size={13} aria-hidden="true" /> Your story starts here</span>
        <h1 id="onboarding-title">Create your profile</h1>
        <p className="onboarding-intro">Tell people a little about you. Your phone number is never shown on your profile.</p>

        <form className="onboarding-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="onboarding-fields">
            <label className="auth-field">
              <span>First name</span>
              <input required maxLength={35} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="auth-field">
              <span>Age <small>18+</small></span>
              <input
                type="number"
                required
                min={18}
                max={99}
                value={age}
                onChange={(event) => setAge(event.target.value)}
              />
            </label>
          </div>

          <div className="onboarding-fields">
            <label className="auth-field">
              <span>Gender</span>
              <select required value={gender} onChange={(event) => setGender(event.target.value)}>
                <option value="">Choose one</option>
                <option value="Woman">Woman</option>
                <option value="Man">Man</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Self-describe">Self-describe</option>
              </select>
            </label>
            <label className="auth-field">
              <span>City</span>
              <input required maxLength={45} value={location} onChange={(event) => setLocation(event.target.value)} />
            </label>
          </div>

          {gender === 'Self-describe' && (
            <label className="auth-field">
              <span>Describe your gender</span>
              <input
                required
                maxLength={40}
                value={selfDescribedGender}
                onChange={(event) => setSelfDescribedGender(event.target.value)}
              />
            </label>
          )}

          <fieldset className="onboarding-choice-group">
            <legend>Who would you like to discover?</legend>
            <div className="preference-options">
              {preferenceOptions.map((preference) => (
                <button
                  key={preference}
                  className={`preference-chip${lookingFor.includes(preference) ? ' selected' : ''}`}
                  type="button"
                  aria-pressed={lookingFor.includes(preference)}
                  onClick={() => togglePreference(preference)}
                >
                  {preference === 'Everyone' ? 'Everyone' : preference}
                </button>
              ))}
            </div>
            <small>People will only see you if you both match each other’s preferences.</small>
          </fieldset>

          <div className="auth-field">
            <span>Pick a few interests</span>
            <InterestPicker interests={interestOptions} selected={interests} onChange={setInterests} />
          </div>

          <label className="auth-field">
            <span>About you <small>optional</small></span>
            <textarea maxLength={150} value={bio} onChange={(event) => setBio(event.target.value)} />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="coy-button coy-button-primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Creating profile…' : 'Start discovering'}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
        <p className="onboarding-privacy">Only mutual likes become matches. You can update your profile anytime.</p>
      </section>
    </main>
  )
}

export default Onboarding
