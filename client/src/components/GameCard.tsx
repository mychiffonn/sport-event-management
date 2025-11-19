import { Link } from "react-router-dom"

import type { Game } from "@/services/api"
import FormattedDatetime from "@/components/FormattedDatetime"

interface GameCardProps {
  game: Game
  currentUserId?: string
}

function GameCard({ game, currentUserId }: GameCardProps) {
  // calc spots remaning
  const spotsRemaining = game.max_capacity - game.current_capacity
  const isFull = spotsRemaining === 0

  const isOrganizer = currentUserId && game.organizer_id === currentUserId

  return (
    <div className="card bg-base-100 transition-shadow hover:shadow-lg">
      <div className="card-body">
        <h2 className="card-title">
          <span className="flex-1 truncate">{game.title}</span>
          <div className="badge badge-secondary whitespace-nowrap">{game.sport_type}</div>
          {isOrganizer && (
            <div className="badge badge-accent whitespace-nowrap">You're Hosting</div>
          )}
        </h2>
        {/* location */}
        <p className="text-sm opacity-70">{game.location}</p>

        {/*date and time*/}
        <FormattedDatetime datetime={game.scheduled_at} variant="short" className="text-sm" />

        {/* description*/}
        {game.description && <p className="mt-2 text-sm">{game.description}</p>}

        {/*capacity*/}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">
              {game.current_capacity} / {game.max_capacity} players
            </span>
          </div>
          <progress
            className={`progress ${isFull ? "progress-error" : "progress-success"} w-full`}
            value={game.current_capacity}
            max={game.max_capacity}
          />
        </div>
        {/*actions*/}
        <div className="card-actions mt-4 justify-end">
          <Link to={`/games/${game.id}`} className="btn btn-primary btn-sm">
            {isFull ? "Full - View Details" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GameCard
