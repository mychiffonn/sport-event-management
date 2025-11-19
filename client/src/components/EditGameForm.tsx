import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SPORT_TYPES } from "@/constants/sports"
import { getUserTimezone } from "@/utils/format-date"

import { api, type Game } from "@/services/api"

function EditGameForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localDate, setLocalDate] = useState("")
  const [localTime, setLocalTime] = useState("")

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return

      try {
        setLoading(true)
        const gameData = await api.getGame(Number(id))
        setGame(gameData)

        // Parse scheduled_at (backend returns Date object or ISO string)
        const scheduledDate = new Date(gameData.scheduled_at)

        // Format for date input (YYYY-MM-DD)
        const year = scheduledDate.getFullYear()
        const month = String(scheduledDate.getMonth() + 1).padStart(2, "0")
        const day = String(scheduledDate.getDate()).padStart(2, "0")
        setLocalDate(`${year}-${month}-${day}`)

        // Format for time input (HH:MM)
        const hours = String(scheduledDate.getHours()).padStart(2, "0")
        const minutes = String(scheduledDate.getMinutes()).padStart(2, "0")
        setLocalTime(`${hours}:${minutes}`)

        setError(null)
      } catch (err) {
        setError("Failed to load game")
        console.error("Error fetching game:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id || !game) return

    const formData = new FormData(e.currentTarget)

    const dateStr = formData.get("date") as string
    const timeStr = formData.get("time") as string

    // Get user's timezone
    const timezone = getUserTimezone()

    // Validate date is in the future (using local time)
    const localDateTime = new Date(`${dateStr}T${timeStr}`)
    if (localDateTime <= new Date()) {
      setError("Game date and time must be in the future")
      return
    }

    // Combine date and time into ISO timestamp format
    const scheduled_at = `${dateStr}T${timeStr}:00`

    // Build updates object
    const updates = {
      title: formData.get("title") as string,
      sport_type: formData.get("sport_type") as string,
      location: formData.get("location") as string,
      scheduled_at: scheduled_at, // ISO timestamp
      timezone: timezone, // User's timezone for display
      max_capacity: parseInt(formData.get("max_capacity") as string),
      description: (formData.get("description") as string)?.trim() || ""
    }

    // Validation
    if (
      !updates.title ||
      !updates.sport_type ||
      !updates.location ||
      !updates.scheduled_at ||
      !updates.timezone ||
      !updates.max_capacity
    ) {
      setError("Please fill in all required fields")
      return
    }

    if (updates.max_capacity < 2) {
      setError("Capacity must be at least 2 players")
      return
    }

    // Capacity check
    if (updates.max_capacity < game.current_capacity) {
      setError(`Cannot reduce capacity below current RSVPs (${game.current_capacity})`)
      return
    }

    try {
      setSaving(true)
      setError(null)
      await api.updateGame(Number(id), updates)
      navigate(`/games/${id}`)
    } catch (err) {
      setError("Failed to update game. Please try again.")
      console.error("Error updating game:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error && !game) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="alert alert-error">
        <span>Game not found</span>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 mx-auto max-w-2xl shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4 text-2xl">Edit Game</h2>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Game Title *</span>
            </label>
            <input
              type="text"
              name="title"
              defaultValue={game.title}
              placeholder="e.g., Friday Night Basketball"
              className="input w-full rounded-md"
              required
            />
          </div>

          {/* Sport Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sport Type *</span>
            </label>
            <select
              name="sport_type"
              defaultValue={game.sport_type}
              className="select w-full rounded-md"
              required
            >
              <option value="">Select a sport</option>
              {SPORT_TYPES.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Location *</span>
            </label>
            <input
              type="text"
              name="location"
              defaultValue={game.location}
              placeholder="e.g., Central Park Courts"
              className="input w-full rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date *</span>
              </label>
              <input
                type="date"
                name="date"
                defaultValue={localDate}
                className="input w-full rounded-md"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Time *</span>
              </label>
              <input
                type="time"
                name="time"
                defaultValue={localTime}
                className="input w-full rounded-md"
                required
              />
            </div>
          </div>

          {/* Max Capacity */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Max Capacity *</span>
            </label>
            <input
              type="number"
              name="max_capacity"
              defaultValue={game.max_capacity}
              placeholder="e.g., 10"
              min={game.current_capacity}
              className="input w-full rounded-md"
              required
            />
            <label className="label">
              <span className="label-text-alt">
                Current RSVPs: {game.current_capacity}. Cannot reduce below this number.
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              defaultValue={game.description || ""}
              placeholder="Add any additional details about the game..."
              className="textarea h-24 rounded-md"
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/games/${id}`)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditGameForm
