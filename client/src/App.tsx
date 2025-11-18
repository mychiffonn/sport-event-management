import { Route, BrowserRouter as Router, Routes } from "react-router-dom"

import BrowseGamesPage from "@/pages/BrowseGamesPage"
import CreateGamePage from "@/pages/CreateGamePage"
import EditGamePage from "@/pages/EditGamePage"
import GameDetailPage from "@/pages/GameDetailPage"
import HomePage from "@/pages/HomePage"
import MyEventsPage from "@/pages/MyEventsPage"
import NotFoundPage from "@/pages/NotFoundPage"
import ProfilePage from "@/pages/ProfilePage"
import UserProfilePage from "@/pages/UserProfilePage"
import Layout from "@/layouts/Layout"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<BrowseGamesPage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/games/:id/edit" element={<EditGamePage />} />
          <Route path="/games/new/" element={<CreateGamePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="*" element={<NotFoundPage />} /> {/*caches all unmatched routes*/}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
