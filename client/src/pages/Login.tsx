import { ArrowRight, LockKeyhole, Phone, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/useAuth'
import { requestPhoneCode, verifyPhoneCode } from '../services/authApi'

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error
  }
  return 'We could not connect. Check that the backend is running and try again.'
}

function Login() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('+91')
  const [code, setCode] = useState('')
  const [codeRequested, setCodeRequested] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const message = await requestPhoneCode(phoneNumber.trim())
      setCodeRequested(true)
      setNotice(message)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const profileRequired = await verifyPhoneCode(phoneNumber.trim(), code.trim())
      await refresh()
      navigate(profileRequired ? '/onboarding' : '/discover', { replace: true })
    } catch (verificationError) {
      setError(getErrorMessage(verificationError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="brand auth-brand" to="/" aria-label="Joy home">
          <BrandLogo />
        </Link>
        <span className="eyebrow">Real connections, at your pace</span>
        <h1 id="login-title">{codeRequested ? 'Check your code' : 'Find your kind of connection.'}</h1>
        <p className="auth-intro">
          {codeRequested
            ? `Enter the 5-digit code for ${phoneNumber}.`
            : 'Sign in or create your private profile with your phone number.'}
        </p>

        {codeRequested ? (
          <form className="auth-form" onSubmit={(event) => void handleVerifyCode(event)}>
            <label className="auth-field">
              <span>Verification code</span>
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={5}
                pattern="[0-9]{5}"
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
              />
            </label>
            <button className="coy-button coy-button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'Verifying…' : 'Continue'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button
              className="auth-text-button"
              type="button"
              disabled={busy}
              onClick={() => {
                setCodeRequested(false)
                setCode('')
                setNotice('')
                setError('')
              }}
            >
              Change phone number
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={(event) => void handleRequestCode(event)}>
            <label className="auth-field">
              <span>Phone number with country code</span>
              <span className="auth-phone-input">
                <Phone size={17} aria-hidden="true" />
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="+919876543210"
                />
              </span>
            </label>
            <button className="coy-button coy-button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'Sending code…' : 'Continue with phone'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
        )}

        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}

        <div className="auth-trust-row">
          <span><LockKeyhole size={15} aria-hidden="true" /> Your number stays private</span>
          <span><ShieldCheck size={15} aria-hidden="true" /> 18+ community</span>
        </div>
        <p className="auth-dev-note">
          Local development only: use code 12345. No SMS is sent.
        </p>
      </section>
    </main>
  )
}

export default Login
