import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"

import BrowseGamesPage from "@/pages/BrowseGamesPage"
import CreateGamePage from "@/pages/CreateGamePage"
import EditGamePage from "@/pages/EditGamePage"
import GameDetailPage from "@/pages/GameDetailPage"
import MyGamesPage from "@/pages/MyGamesPage"
import NotFoundPage from "@/pages/NotFoundPage"
import ProfilePage from "@/pages/ProfilePage"
import SignInPage from "@/pages/SignInPage"
import SignUpPage from "@/pages/SignUpPage"
import UserProfilePage from "@/pages/UserProfilePage"
import Layout from "@/layouts/Layout"
import ProtectedRoute from "@/components/ProtectedRoute"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<BrowseGamesPage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            {/* Protected routes */}
            <Route
              path="/my-games"
              element={
                <ProtectedRoute>
                  <MyGamesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/:id/edit"
              element={
                <ProtectedRoute>
                  <EditGamePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/new/"
              element={
                <ProtectedRoute>
                  <CreateGamePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} /> {/*caches all unmatched routes*/}
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
