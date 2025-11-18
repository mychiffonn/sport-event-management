import type { Game, RSVP } from "@server/types"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export const api = {
  // get all games
  async getGames(filters?: {
    sport_type?: string
    location?: string
    date_start?: string
    date_end?: string
    has_spots?: boolean
    search?: string
    sort?: string
  }): Promise<Game[]> {
    const params = new URLSearchParams()
    if (filters?.sport_type) params.append("sport_type", filters.sport_type)
    if (filters?.location) params.append("location", filters.location)
    if (filters?.date_start) params.append("date_start", filters.date_start)
    if (filters?.date_end) params.append("date_end", filters.date_end)
    if (filters?.has_spots !== undefined) params.append("has_spots", String(filters.has_spots))
    if (filters?.search) params.append("search", filters.search)
    if (filters?.sort) params.append("sort", filters.sort)

    const url = `${API_BASE_URL}/games${params.toString() ? `?${params.toString()}` : ""}`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch games")
    return response.json()
  },

  // get single game by ID
  async getGame(id: number): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games/${id}`)
    if (!response.ok) throw new Error("Failed to fetch game")
    return response.json()
  },

  // create a new game
  async createGame(
    game: Omit<Game, "id" | "created_at" | "updated_at" | "current_capacity">
  ): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(game)
    })
    if (!response.ok) throw new Error("Failed to create game")
    return response.json()
  },

  // update a game
  async updateGame(id: number, updates: Partial<Game>): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error("Failed to update game")
    return response.json()
  },

  // delete a game
  async deleteGame(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: "DELETE"
    })
    if (!response.ok) throw new Error("Failed to delete game")
  },

  // get RSVPs for a game
  async getRSVPs(gameId: number): Promise<RSVP[]> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/rsvps`)
    if (!response.ok) throw new Error("Failed to fetch RSVPs")
    return response.json()
  },

  // create an RSVP
  async createRSVP(gameId: number, userId: number): Promise<RSVP> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/rsvps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create RSVP")
    }
    return response.json()
  },

  // update an RSVP status
  async updateRSVP(rsvpId: number, status: "going" | "maybe" | "not_going"): Promise<RSVP> {
    const response = await fetch(`${API_BASE_URL}/rsvps/${rsvpId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update RSVP")
    }
    return response.json()
  },

  // delete an RSVP
  async deleteRSVP(rsvpId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rsvps/${rsvpId}`, {
      method: "DELETE"
    })
    if (!response.ok) throw new Error("Failed to delete RSVP")
  },

  async getUser(
    userId: number
  ): Promise<{ id: number; name: string; email: string; created_at: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    if (!response.ok) throw new Error("Failed to fetch user")
    return response.json()
  },

  async getUserHostedGames(userId: number): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/hosted`)
    if (!response.ok) throw new Error("Failed to fetch hosted games")
    return response.json()
  },

  async getUserRSVPGames(userId: number): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/rsvps`)
    if (!response.ok) throw new Error("Failed to fetch RSVP'd games")
    return response.json()
  },

  async getUserPastGames(userId: number): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/past`)
    if (!response.ok) throw new Error("Failed to fetch past games")
    return response.json()
  },
  async getUserPastHostedGames(userId: number): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/past-hosted`)
    if (!response.ok) throw new Error("Failed to fetch past hosted games")
    return response.json()
  }
}

export type { Game, RSVP }
