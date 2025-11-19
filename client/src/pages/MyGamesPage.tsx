import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

import { api, type Game } from "@/services/api"
import GameCard from "@/components/GameCard"

function MyGamesPage() {
  const { user } = useAuth()
  const currentUserId = user?.id
  const [hostedGames, setHostedGames] = useState<Game[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [pastGames, setPastGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserGames = async () => {
      if (!currentUserId) return

      try {
        setLoading(true)
        const [hosted, upcoming, pastRSVPs, pastHosted] = await Promise.all([
          api.getUserHostedGames(currentUserId),
          api.getUserRSVPGames(currentUserId),
          api.getUserPastGames(currentUserId),
          api.getUserPastHostedGames(currentUserId)
        ])
        setHostedGames(hosted)
        setUpcomingGames(upcoming)
        const allPastGames = [...pastRSVPs, ...pastHosted]
        allPastGames.sort((a, b) => {
          const dateA = new Date(a.scheduled_at)
          const dateB = new Date(b.scheduled_at)
          return dateB.getTime() - dateA.getTime()
        })
        setPastGames(allPastGames)
      } catch (err) {
        console.error("Error fetching user games: ", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserGames()
  }, [currentUserId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Your Dashboard</h1>
        <p className="mb-4 text-lg opacity-70">Manage your games and see what's coming up</p>
        <Link to="/" className="btn btn-primary">
          Browse All Games
        </Link>
      </div>

      {/* Games You're Hosting */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Games You're Hosting ({hostedGames.length})</h2>
        {hostedGames.length === 0 ? (
          <div className="alert alert-info">
            <span>
              You haven't created any games yet.{" "}
              <Link to="/games/new" className="link">
                Create one now!
              </Link>
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hostedGames.map((game) => (
              <GameCard key={game.id} game={game} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Games (RSVP'd) */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Upcoming Games ({upcomingGames.length})</h2>
        {upcomingGames.length === 0 ? (
          <div className="alert alert-info">
            <span>
              You haven't RSVP'd to any upcoming games.{" "}
              <Link to="/" className="link">
                Find a game to join!
              </Link>
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <GameCard key={game.id} game={game} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Past Events ({pastGames.length})</h2>
        {pastGames.length === 0 ? (
          <div className="alert alert-info">
            <span>No past events yet. Join some games to build your history!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastGames.map((game) => (
              <GameCard key={game.id} game={game} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyGamesPage
