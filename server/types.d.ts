export interface Game {
  id: number
  organizer_id: string
  title: string
  sport_type: string
  location: string
  scheduled_at: string
  timezone: string
  max_capacity: number
  current_capacity: number
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateGameInput {
  organizer_id: string
  title: string
  sport_type: string
  location: string
  scheduled_at: string
  timezone: string
  max_capacity: number
  description?: string
}

export interface UpdateGameInput {
  title?: string
  sport_type?: string
  location?: string
  scheduled_at?: string
  timezone?: string
  max_capacity?: number
  description?: string
}

// RSVP types
export type RSVPStatus = "going" | "maybe" | "not_going"

export interface RSVP {
  id: number
  game_id: number
  user_id: string
  status: RSVPStatus
  created_at: string
  updated_at: string
  user_name?: string
}

export interface CreateRSVPInput {
  game_id: number
  user_id: string
}

export interface UpdateRSVPInput {
  status: RSVPStatus
}

// Query filters
export interface GameFilters {
  sport_type?: string
  location?: string
  date_start?: string
  date_end?: string
  has_spots?: string | boolean
  search?: string
  sort?: string
  organizer_id?: string
}
