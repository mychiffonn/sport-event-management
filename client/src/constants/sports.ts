export const SPORT_TYPES = [
  "Basketball",
  "Soccer",
  "Tennis",
  "Table Tennis",
  "Volleyball",
  "Badminton",
  "Baseball",
  "Football"
] as const

export type SportType = (typeof SPORT_TYPES)[number]
