import { useEffect, useState } from "react"
import { SPORT_TYPES } from "@/constants/sports"

interface FilterBarProps {
  onFilterChange: (filters: {
    sport_type?: string
    location?: string
    date_start?: string
    date_end?: string
    has_spots?: boolean
    search?: string
    sort?: string
  }) => void
  initialFilters?: {
    sport_type?: string
    location?: string
    date_start?: string
    date_end?: string
    has_spots?: boolean
    search?: string
    sort?: string
  }
}

function FilterBar({ onFilterChange, initialFilters = {} }: FilterBarProps) {
  const [filters, setFilters] = useState({
    sportType: initialFilters.sport_type || "",
    location: initialFilters.location || "",
    dateStart: initialFilters.date_start || "",
    dateEnd: initialFilters.date_end || "",
    hasSpots: initialFilters.has_spots || false,
    search: initialFilters.search || "",
    sortValue: initialFilters.sort || "date-asc"
  })

  useEffect(() => {
    setFilters({
      sportType: initialFilters.sport_type || "",
      location: initialFilters.location || "",
      dateStart: initialFilters.date_start || "",
      dateEnd: initialFilters.date_end || "",
      hasSpots: initialFilters.has_spots || false,
      search: initialFilters.search || "",
      sortValue: initialFilters.sort || "date-asc"
    })
  }, [initialFilters])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (filters.dateStart && filters.dateEnd && filters.dateStart > filters.dateEnd) {
      alert("Start date cannot be after end date")
      return
    }

    const submitFilters = {
      sport_type: filters.sportType || undefined,
      location: filters.location || undefined,
      date_start: filters.dateStart || undefined,
      date_end: filters.dateEnd || undefined,
      has_spots: filters.hasSpots ? true : undefined,
      search: filters.search || undefined,
      sort: filters.sortValue
    }

    // Remove empty values
    Object.keys(submitFilters).forEach(
      (key) =>
        submitFilters[key as keyof typeof submitFilters] === undefined &&
        delete submitFilters[key as keyof typeof submitFilters]
    )

    onFilterChange(submitFilters)
  }

  const handleReset = () => {
    setFilters({
      sportType: "",
      location: "",
      dateStart: "",
      dateEnd: "",
      hasSpots: false,
      search: "",
      sortValue: "date-asc"
    })

    // Clear filters
    onFilterChange({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.sportType) count++
    if (filters.location) count++
    if (filters.dateStart) count++
    if (filters.dateEnd) count++
    if (filters.hasSpots) count++
    if (filters.search) count++
    // don't count sort as it always has a value (default: date-asc)
    return count
  }

  return (
    <div className="card bg-base-200 mb-6 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-lg">Search & Filter Games</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Bar - Full Width */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title, description, or location..."
              className="input w-full rounded-md"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sort By</span>
            </label>
            <select
              name="sort"
              className="select w-full rounded-md"
              value={filters.sortValue}
              onChange={(e) => setFilters({ ...filters, sortValue: e.target.value })}
            >
              <option value="date-asc">Date (Soonest First)</option>
              <option value="date-desc">Date (Latest First)</option>
              <option value="spots-desc">Most Spots Available</option>
              <option value="spots-asc">Least Spots Available</option>
              <option value="newest">Newest Games</option>
              <option value="oldest">Oldest Games</option>
            </select>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Sport Type Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Sport</span>
              </label>
              <select
                name="sport_type"
                className="select w-full rounded-md"
                value={filters.sportType}
                onChange={(e) => setFilters({ ...filters, sportType: e.target.value })}
              >
                <option value="">All Sports</option>
                {SPORT_TYPES.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Filter by city..."
                className="input w-full rounded-md"
              />
            </div>

            {/* date Range Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date From</span>
              </label>
              <input
                type="date"
                name="date_start"
                value={filters.dateStart}
                onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                max={filters.dateEnd || undefined}
                className="input w-full rounded-md"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Date To</span>
              </label>
              <input
                type="date"
                name="date_end"
                value={filters.dateEnd}
                onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                min={filters.dateStart || undefined}
                className="input w-full rounded-md"
              />
            </div>

            {/* Available Spots Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Availability</span>
              </label>
              <div className="flex h-12 items-center">
                <label className="label cursor-pointer gap-2 p-0">
                  <input
                    type="checkbox"
                    name="has_spots"
                    checked={filters.hasSpots}
                    onChange={(e) => setFilters({ ...filters, hasSpots: e.target.checked })}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Has spots</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-control">
              <label className="label">
                <span className="label-text opacity-0">Actions</span>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm">
                  Clear
                </button>
                <button type="submit" className="btn btn-primary btn-sm gap-2">
                  Apply
                  {/*filter cuont badge*/}
                  {getActiveFilterCount() > 0 && (
                    <span className="badge badge-secondary">{getActiveFilterCount()}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FilterBar
