import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

export function CreateGameForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // get values
    const gameData = {
      organizer_id: 1, // TODO: this will come from auth context later
      title: formData.get("title") as string,
      sport_type: formData.get("sport_type") as string,
      location: formData.get("location") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      max_capacity: parseInt(formData.get("max_capacity") as string),
      description: (formData.get("description") as string)?.trim() || ""
    }

    // validation
    if (
      !gameData.title ||
      !gameData.sport_type ||
      !gameData.location ||
      !gameData.date ||
      !gameData.time ||
      !gameData.max_capacity
    ) {
      setError("Please fill in all required fields")
      return
    }

    if (gameData.max_capacity < 2) {
      setError("Capacity must be at least 2 players")
      return
    }

    // check future date
    const gameDataTime = new Date(`${gameData.date}T${gameData.time}`)
    if (gameDataTime <= new Date()) {
      setError("Game data and time must be in the future")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const newGame = await api.createGame(gameData)
      navigate(`/games/${newGame.id}`)
    } catch (err) {
      setError("Failed to create game. Please try again.")
      console.error("Error creating game: ", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-100 mx-auto max-w-2xl shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4 text-2xl">Create New Game</h2>

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
              placeholder="e.g., Friday Night Basketball"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Sport Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sport Type *</span>
            </label>
            <select name="sport_type" className="select select-bordered w-full" required>
              <option value="">Select a sport</option>
              <option value="Basketball">Basketball</option>
              <option value="Soccer">Soccer</option>
              <option value="Tennis">Tennis</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Badminton">Badminton</option>
              <option value="Baseball">Baseball</option>
              <option value="Football">Football</option>
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
              placeholder="e.g., Central Park Courts"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date *</span>
              </label>
              <input type="date" name="date" className="input input-bordered w-full" required />
            </div>

            {/* Time */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Time *</span>
              </label>
              <input type="time" name="time" className="input input-bordered w-full" required />
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
              placeholder="e.g., 10"
              min="2"
              className="input input-bordered w-full"
              required
            />
            <label className="label">
              <span className="label-text-alt">Minimum 2 players required</span>
            </label>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              placeholder="Add any additional details about the game..."
              className="textarea textarea-bordered h-24"
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => navigate("/games")} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Game"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
