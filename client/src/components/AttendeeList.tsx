import { Icon } from "@iconify/react"

import type { RSVP } from "@server/types"

import Avatar from "./Avatar"

interface AttendeeListProps {
  rsvps: RSVP[]
}

export default function AttendeeList({ rsvps }: AttendeeListProps) {
  const goingRsvps = rsvps.filter((r) => r.status === "going")
  const maybeRsvps = rsvps.filter((r) => r.status === "maybe")
  const notGoingRsvps = rsvps.filter((r) => r.status === "not_going")

  const totalCount = rsvps.length
  const showCounters = totalCount > 10

  const renderAvatarGroup = (groupRsvps: RSVP[], ringColor: string) => {
    if (groupRsvps.length === 0) return null

    const visibleCount = showCounters ? 3 : Math.min(groupRsvps.length, 3)
    const remainingCount = groupRsvps.length - visibleCount
    const showCounter = groupRsvps.length > 3

    return (
      <div className="avatar-group -space-x-4 rtl:space-x-reverse">
        {groupRsvps.slice(0, visibleCount).map((rsvp) => (
          <Avatar
            key={rsvp.id}
            userId={rsvp.user_id}
            userName={rsvp.user_name}
            borderColor={ringColor}
          />
        ))}

        {showCounter && remainingCount > 0 && (
          <div className="avatar avatar-placeholder">
            <div
              className={`w-10 rounded-full border-2 ${ringColor} bg-neutral text-neutral-content`}
            >
              <span className="text-xs">+{remainingCount}</span>
            </div>
          </div>
        )}

        {/* Detailed list in dropdown/collapse for mobile */}
        {groupRsvps.length > visibleCount && (
          <details className="collapse-arrow bg-base-200 collapse rounded-lg">
            <summary className="collapse-title min-h-0 py-2 text-xs opacity-70">
              View all {groupRsvps.length}
            </summary>
            <div className="collapse-content">
              <ul className="space-y-1">
                {groupRsvps.slice(visibleCount).map((rsvp) => (
                  <li key={rsvp.id} className="text-sm">
                    {rsvp.user_name || "Unknown"}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          Attendees
          <div className="badge badge-neutral">{totalCount}</div>
        </h2>

        {/* Status Summary - All on one row */}
        {totalCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {goingRsvps.length > 0 && (
              <div className="badge badge-success gap-1">
                <Icon icon="lucide:check-circle" className="text-sm" />
                Going: {goingRsvps.length}
              </div>
            )}
            {maybeRsvps.length > 0 && (
              <div className="badge badge-warning gap-1">
                <Icon icon="lucide:help-circle" className="text-sm" />
                Maybe: {maybeRsvps.length}
              </div>
            )}
            {notGoingRsvps.length > 0 && (
              <div className="badge badge-error gap-1">
                <Icon icon="lucide:x-circle" className="text-sm" />
                Not Going: {notGoingRsvps.length}
              </div>
            )}
          </div>
        )}

        {totalCount === 0 ? (
          <p className="text-sm opacity-70">No RSVPs yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {renderAvatarGroup(goingRsvps, "border-success")}
            {renderAvatarGroup(maybeRsvps, "border-warning")}
            {renderAvatarGroup(notGoingRsvps, "border-error")}
          </div>
        )}
      </div>
    </div>
  )
}
