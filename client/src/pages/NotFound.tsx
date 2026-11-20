import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="not-found-card" aria-labelledby="not-found-title">
      <span className="eyebrow">404 · Page not found</span>
      <h1 id="not-found-title">This page wandered off</h1>
      <p>The page you requested does not exist. Return to Coy Discover to keep exploring.</p>
      <Link className="primary-home-button" to="/">
        Go home
      </Link>
    </section>
  )
}

export default NotFound
