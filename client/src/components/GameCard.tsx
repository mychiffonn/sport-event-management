import type { Game } from "../services/api"
import { Link } from "react-router-dom"

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  // date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    })
  }

  // same with time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // calc spots remaning
  const spotsRemaining = game.max_capacity - game.current_capacity
  const isFull = spotsRemaining === 0

  return (
    <div className="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
      <div className="card-body">
        {/*title and sports title*/}
        <h2 className="card-title">
          {game.title}
          <div className="badge badge-secondary">{game.sport_type}</div>
        </h2>
        {/* location */}
        <p className="text-sm opacity-70">{game.location}</p>

        {/*date and time*/}
        <p className="text-sm">
          {formatDate(game.date)} at {formatTime(game.time)}
        </p>

        {/* description*/}
        {game.description && <p className="mt-2 text-sm">{game.description}</p>}

        {/*capacity*/}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">
              {game.current_capacity} / {game.max_capacity} player
            </span>
            <span className={`text-sm ${isFull ? "text-error" : "text-success"}`}>
              {isFull ? "FULL" : `${spotsRemaining} spots left`}
            </span>
          </div>
          <progress
            className={`progress ${isFull} ? 'progress-error' : 'progress-success'} w-full`}
            value={game.current_capacity}
            max={game.max_capacity}
          />
        </div>
        {/*actions*/}
        <div className="card-actions mt-4 justify-end">
          <Link
            to={`/games/${game.id}`}
            className={`btn b nt-primary btn-sm ${isFull ? "btn-disabled" : ""}`}
          >
            {isFull ? "Full" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  )
}
