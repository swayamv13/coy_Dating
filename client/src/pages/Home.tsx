import { Heart, LockKeyhole, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="home-card" aria-labelledby="home-title">
      <div className="home-card-icon" aria-hidden="true">
        <Heart size={34} strokeWidth={2.2} fill="currentColor" />
      </div>
      <span className="eyebrow">Welcome to Coy Discover</span>
      <h1 id="home-title">Home is a little quiet for now.</h1>
      <p>
        This is your Coy space. Explore thoughtful profiles and let connections happen naturally.
        Likes stay private until both people choose each other.
      </p>
      <div className="home-actions" aria-label="Explore Coy Discover">
        <Link className="primary-home-button" to="/discover">
          Explore Discover
        </Link>
        <Link className="secondary-home-button" to="/profile">
          <UserRound size={15} aria-hidden="true" />
          Manage My Profile
        </Link>
      </div>
      <div className="home-privacy-note">
        <LockKeyhole size={15} strokeWidth={2.2} aria-hidden="true" />
        <span>One-way likes stay private.</span>
      </div>
    </section>
  )
}

export default Home
