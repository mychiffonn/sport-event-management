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
  sport: string
  location: string
  date: string
  time: string
  capacity: number
  description: string
  created_at: string
  updated_at: string
}

export interface CreateGameInput {
  organizer_id: number
  sport: string
  location: string
  date: string
  time: string
  capacity: number
  description: string
}

export interface UpdateGameInput {
  sport?: string
  location?: string
  date?: string
  time?: string
  capacity?: number
  description?: string
}

// RSVP types
export interface RSVP {
  id: number
  game_id: number
  user_id: number
  created_at: string
  updated_at: string
}

export interface CreateRSVPInput {
  game_id: number
  user_id: number
}

// Query filters
export interface GameFilters {
  sport?: string
  location?: string
  date?: string
  organizer_id?: number
}
