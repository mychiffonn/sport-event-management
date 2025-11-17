import { useEffect, useState } from "react"
import { api, type Game } from "../services/api"
import { useSearchParams } from "react-router-dom"
import GameCard from "./GameCard"
import FilterBar from "./FilterBar"

export function GameList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<{
    sport_type?: string
    location?: string
    date_start?: string
    date_end?: string
    has_spots?: boolean
    search?: string
    sort?: string
  }>(() => {
    // initial filters from url
    return {
      sport_type: searchParams.get("sport_type") || undefined,
      location: searchParams.get("location") || undefined,
      date_start: searchParams.get("date_start") || undefined,
      date_end: searchParams.get("date_end") || undefined,
      has_spots: searchParams.get("has_spots") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || undefined
    }
  })
  // update filters when url params change
  useEffect(() => {
    const newFilters = {
      sport_type: searchParams.get("sport_type") || undefined,
      location: searchParams.get("location") || undefined,
      date_start: searchParams.get("date_start") || undefined,
      date_end: searchParams.get("date_end") || undefined,
      has_spots: searchParams.get("has_spots") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || undefined
    }
    setFilters(newFilters)
  }, [searchParams])

  // fetch games when component mounts
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        const data = await api.getGames(filters)
        setGames(data)
        setError(null)
      } catch (err) {
        setError("Failed to load games. Please try again later.")
        console.error("Error fetching games: ", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [filters])

  // handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)

    const params = new URLSearchParams()
    if (newFilters.sport_type) params.set("sport_type", newFilters.sport_type)
    if (newFilters.location) params.set("location", newFilters.location)
    if (newFilters.date_start) params.set("date_start", newFilters.date_start)
    if (newFilters.date_end) params.set("date_end", newFilters.date_end)
    if (newFilters.has_spots) params.set("has_spots", "true")
    if (newFilters.search) params.set("search", newFilters.search)
    if (newFilters.sort) params.set("sort", newFilters.sort)

    setSearchParams(params)
  }

  // loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  // error state
  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  // empty state
  if (games.length === 0) {
    return (
      <div className="alert alert-info">
        <span>No games available. Be the first to create one!</span>
      </div>
    )
  }

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Empty state */}
      {games.length === 0 ? (
        <div className="alert alert-info">
          <span>No games found matching your filters. Try adjusting your search!</span>
        </div>
      ) : (
        /* Games grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} currentUserId={1} />
          ))}
        </div>
      )}
    </div>
  )
}
