import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

import { api, type Game, type RSVP } from "@/services/api"
import AttendeeList from "@/components/AttendeeList"
import FormattedDatetime from "@/components/FormattedDatetime"
import RSVPButton from "@/components/RSVPButton"

function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?.id
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
      } catch {
        setError("Failed to load game details")
      } finally {
        setLoading(false)
      }
    }

    fetchGameDetails()
  }, [id])

  const handleDeleteGame = async (gameId: number) => {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      return
    }

    try {
      await api.deleteGame(gameId)
      // Redirect to games list after deletion
      navigate("/")
    } catch {
      alert("Failed to delete game. Please try again.")
    }
  }

  // Handler for optimistic RSVP updates
  const handleRsvpChange = (updatedRsvp: RSVP | null) => {
    if (!currentUserId) return

    setRsvps((prevRsvps) => {
      // Remove existing RSVP for this user
      const filtered = prevRsvps.filter((r) => r.user_id !== currentUserId)

      // Add the new/updated RSVP if it exists
      if (updatedRsvp) {
        return [...filtered, updatedRsvp]
      }

      return filtered
    })
  }

  // Handler for optimistic capacity updates
  const handleCapacityChange = (delta: number) => {
    setGame((prevGame) => {
      if (!prevGame) return null
      return {
        ...prevGame,
        current_capacity: Math.max(0, prevGame.current_capacity + delta)
      }
    })
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
  const isPast = new Date(game.scheduled_at) < new Date()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <a href="/" className="btn btn-ghost btn-sm">
          ← Back to browsing games
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
                  <FormattedDatetime datetime={game.scheduled_at} className="text-lg" />
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

              {/* Organizer Actions */}
              {currentUserId && game.organizer_id === currentUserId && (
                <div className="card-actions mt-6 justify-end">
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RSVP & Attendees Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* RSVP Actions */}
          {(!currentUserId || game.organizer_id !== currentUserId) && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">Your RSVP</h3>
                {!currentUserId ? (
                  <div className="tooltip tooltip-bottom" data-tip="Sign in to RSVP">
                    <div className="pointer-events-none opacity-50">
                      <RSVPButton
                        gameId={game.id}
                        userId=""
                        currentRsvp={undefined}
                        isFull={isFull}
                        isPast={isPast}
                        onRsvpChange={() => {}}
                        onCapacityChange={() => {}}
                      />
                    </div>
                  </div>
                ) : (
                  <RSVPButton
                    gameId={game.id}
                    userId={currentUserId}
                    currentRsvp={rsvps.find((rsvp) => rsvp.user_id === currentUserId)}
                    isFull={isFull}
                    isPast={isPast}
                    onRsvpChange={handleRsvpChange}
                    onCapacityChange={handleCapacityChange}
                  />
                )}
              </div>
            </div>
          )}

          {/* Attendees List */}
          <AttendeeList rsvps={rsvps} />
        </div>
      </div>
    </div>
  )
}

export default GameDetailPage
