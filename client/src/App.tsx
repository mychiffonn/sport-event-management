import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom"
import { GameList } from "@/components/GameList"
import { Layout } from "@/components/Layout"
import { api, type Game, type RSVP } from "@/services/api"
import { CreateGameForm } from "@/components/CreateGameForm"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { EditGameForm } from "./components/EditGameForm"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<BrowseGamesPage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/games/:id/edit" element={<EditGamePage />} />
          <Route path="games/new/" element={<CreateGamePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

// Placeholder components
function HomePage() {
  return (
    <div className="hero bg-base200 min-h-[60vh]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to Sport Connect</h1>
          <p className="py-6">
            Find and join recreational sports events in your community. Connect with other player
            and organize games easily!
          </p>
          <a href="/games" className="btn btn-primary">
            Browse Games
          </a>
        </div>
      </div>
    </div>
  )
}

function EditGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EditGameForm />
    </div>
  )
}

function BrowseGamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4x1 mb-2 font-bold">Browse Games</h1>
        <p className="text-lg opacity-70">
          Find and join recreational sports events in your community
        </p>
      </div>
      <GameList />
    </div>
  )
}

function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<Game | null>(null)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [gameData, rsvpData] = await Promise.all([
          api.getGame(Number(id)),
          api.getRSVPs(Number(id))
        ])
        setGame(gameData)
        setRsvps(rsvpData)
        setError(null)
      } catch (err) {
        setError("Failed to load game details")
        console.error("Error fetching game details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGameDetails()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleDeleteGame = async (gameId: number) => {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      return
    }

    try {
      await api.deleteGame(gameId)
      // Redirect to games list after deletion
      navigate("/games")
    } catch (err) {
      alert("Failed to delete game. Please try again.")
      console.error("Error deleting game:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error || "Game not found"}</span>
        </div>
      </div>
    )
  }

  const spotsRemaining = game.max_capacity - game.current_capacity
  const isFull = spotsRemaining === 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <a href="/games" className="btn btn-ghost btn-sm">
          ← Back to Games
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Game Info */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {/* Title and Sport Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">{game.title}</h1>
                  <div className="badge badge-secondary badge-lg">{game.sport_type}</div>
                </div>
                {isFull && <div className="badge badge-error badge-lg">FULL</div>}
              </div>

              <div className="divider"></div>

              {/* Game Details Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-sm font-semibold opacity-70">📍 Location</h3>
                  <p className="text-lg">{game.location}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold opacity-70">🗓️ Date & Time</h3>
                  <p className="text-lg">{formatDate(game.date)}</p>
                  <p className="text-lg">{formatTime(game.time)}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold opacity-70">👥 Capacity</h3>
                  <p className="text-lg">
                    {game.current_capacity} / {game.max_capacity} players
                  </p>
                  <progress
                    className={`progress ${isFull ? "progress-error" : "progress-success"} mt-2 w-full`}
                    value={game.current_capacity}
                    max={game.max_capacity}
                  />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold opacity-70">✨ Available Spots</h3>
                  <p className={`text-2xl font-bold ${isFull ? "text-error" : "text-success"}`}>
                    {isFull ? "None" : spotsRemaining}
                  </p>
                </div>
              </div>

              {game.description && (
                <>
                  <div className="divider"></div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold opacity-70">📝 Description</h3>
                    <p className="text-base">{game.description}</p>
                  </div>
                </>
              )}

              {/* RSVP Button */}
              <div className="card-actions mt-6 justify-end">
                {/*TODO: replace with the real user ID from auth context */}
                {game.organizer_id === 1 ? (
                  <div className="flex w-full justify-end gap-2">
                    <button className="btn btn-error" onClick={() => handleDeleteGame(game.id)}>
                      Delete Game
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => navigate(`/games/${game.id}/edit`)}
                    >
                      Edit Game
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-lg" disabled={isFull}>
                    {isFull ? "Game is Full" : "RSVP to this Game"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attendees Sidebar */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Attendees ({rsvps.length})</h2>

              {rsvps.length === 0 ? (
                <p className="text-sm opacity-70">No RSVPs yet. Be the first!</p>
              ) : (
                <ul className="space-y-2">
                  {rsvps.map((rsvp) => (
                    <li
                      key={rsvp.id}
                      className="hover:bg-base-200 flex items-center gap-3 rounded-lg p-2"
                    >
                      {/* Avatar */}
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content w-10 rounded-full">
                          <span className="text-sm">{rsvp.user_name?.charAt(0) || "?"}</span>
                        </div>
                      </div>
                      {/* User Info */}
                      <div className="flex-1">
                        <p className="font-semibold">{rsvp.user_name || "Unknown"}</p>
                        <p className="text-xs opacity-70">
                          {rsvp.status === "confirmed" && "Confirmed"}
                          {rsvp.status === "waitlisted" && "Waitlisted"}
                          {rsvp.status === "rejected" && "Rejected"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateGamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CreateGameForm />
    </div>
  )
}

function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Your Profile</h1>
      <p>Profile settings will appear here.</p>
    </div>
  )
}

function MyEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Your Events</h1>
      <p>Your posted games, upcoming RSVPs, and past events will appear here.</p>
    </div>
  )
}

export default App
