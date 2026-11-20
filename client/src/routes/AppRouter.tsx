import { Navigate, Route, Routes } from 'react-router-dom'
import ApplicationLayout from '../layout/ApplicationLayout'
import Discover from '../pages/Discover'
import Home from '../pages/Home'
import Matches from '../pages/Matches'
import NotFound from '../pages/NotFound'
import { ProfilePage } from '../pages/Profile'

function AppRouter() {
  return (
    <Routes>
      <Route element={<ApplicationLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
