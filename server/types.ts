// User types
export interface User {
  id: number
  email: string
  name: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  email: string
  name: string
  password_hash: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
  password_hash?: string
}

// Game/Event types
export interface Game {
  id: number
  organizer_id: number
  title: string
  sport_type: string
  location: string
  date: string
  time: string
  max_capacity: number
  current_capacity: number
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateGameInput {
  organizer_id: number
  title: string
  sport_type: string
  location: string
  date: string
  time: string
  max_capacity: number
  description?: string
}

export interface UpdateGameInput {
  title?: string
  sport_type?: string
  location?: string
  date?: string
  time?: string
  max_capacity?: number
  description?: string
}

// RSVP types
export interface RSVP {
  id: number
  game_id: number
  user_id: number
  status: "confirmed" | "waitlisted" | "rejected"
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export interface CreateRSVPInput {
  game_id: number
  user_id: number
}

export interface UpdateRSVPInput {
  status: "confirmed" | "waitlisted" | "rejected"
}

// Query filters
export interface GameFilters {
  sport_type?: string
  location?: string
  date?: string
  has_spots?: string | boolean
  organizer_id?: number
}
