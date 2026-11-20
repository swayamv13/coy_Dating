import { Heart } from 'lucide-react'

function BrandLogo() {
  return (
    <span className="brand-logo">
      <Heart className="brand-heart" size={25} strokeWidth={2.6} aria-hidden="true" />
      <span className="brand-word">Joy</span>
    </span>
  )
}

export default BrandLogo
