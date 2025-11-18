import { Icon } from "@iconify/react"
import { useState } from "react"

import type { RSVP, RSVPStatus } from "@server/types"

interface RSVPButtonProps {
  gameId: number
  userId: number
  currentRsvp: RSVP | undefined
  isFull: boolean
  onRsvpChange: (rsvp: RSVP | null) => void
  onCapacityChange: (delta: number) => void
}

export default function RSVPButton({
  gameId,
  userId,
  currentRsvp,
  isFull,
  onRsvpChange,
  onCapacityChange
}: RSVPButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateRSVP = async (newStatus: RSVPStatus) => {
    if (!currentRsvp) return

    const oldStatus = currentRsvp.status
    setLoading(true)

    // Optimistic update
    const optimisticRsvp = { ...currentRsvp, status: newStatus }
    onRsvpChange(optimisticRsvp)

    // Update capacity optimistically
    const oldIsGoing = oldStatus === "going"
    const newIsGoing = newStatus === "going"
    if (oldIsGoing && !newIsGoing) {
      onCapacityChange(-1)
    } else if (!oldIsGoing && newIsGoing) {
      onCapacityChange(1)
    }

    try {
      const { api } = await import("@/services/api")
      await api.updateRSVP(currentRsvp.id, newStatus)
    } catch (err) {
      console.error("Error updating RSVP:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update RSVP"
      alert(errorMessage)

      // Rollback on error
      onRsvpChange(currentRsvp)
      if (oldIsGoing && !newIsGoing) {
        onCapacityChange(1)
      } else if (!oldIsGoing && newIsGoing) {
        onCapacityChange(-1)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRSVP = async () => {
    if (!currentRsvp) return

    if (!confirm("Are you sure you want to cancel your RSVP?")) {
      return
    }

    const wasGoing = currentRsvp.status === "going"
    setLoading(true)

    // Optimistic update
    onRsvpChange(null)
    if (wasGoing) {
      onCapacityChange(-1)
    }

    try {
      const { api } = await import("@/services/api")
      await api.deleteRSVP(currentRsvp.id)
    } catch (err) {
      console.error("Error cancelling RSVP:", err)
      alert("Failed to cancel RSVP. Please try again.")

      // Rollback on error
      onRsvpChange(currentRsvp)
      if (wasGoing) {
        onCapacityChange(1)
      }
    } finally {
      setLoading(false)
    }
  }

  // Determine which status is currently active (null if no RSVP)
  const currentStatus = currentRsvp?.status || null
  const isLoading = (status: RSVPStatus | null) => loading && currentStatus === status

  // Handler for button clicks
  const handleStatusClick = async (status: RSVPStatus) => {
    if (!currentRsvp) {
      // Create new RSVP with the selected status
      setLoading(true)
      try {
        const { api } = await import("@/services/api")
        const newRsvp = await api.createRSVP(gameId, userId)

        // RSVP created with default status="going" (capacity +1 on backend)
        if (status !== "going") {
          // User wants a different status, update it
          const updatedRsvp = await api.updateRSVP(newRsvp.id, status)
          onRsvpChange(updatedRsvp)
          // Backend: create (+1) then update to non-going (-1) = net 0
          // No capacity change needed on frontend
        } else {
          // User wants "going", no update needed
          onRsvpChange(newRsvp)
          onCapacityChange(1) // Increment capacity for "going"
        }
      } catch (err) {
        console.error("Error creating RSVP:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to RSVP"
        console.error("Full error details:", { gameId, userId, error: err })
        alert(`Failed to RSVP: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    } else {
      // Update existing RSVP
      await handleUpdateRSVP(status)
    }
  }

  // Always show three status buttons
  return (
    <div className="flex flex-col gap-3">
      {isFull && !currentRsvp && (
        <div className="alert alert-warning">
          <Icon icon="lucide:alert-circle" className="text-lg" />
          <span className="text-sm">This game is full</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {/* Going Button */}
        <div className="tooltip" data-tip="I'll be there!">
          <button
            className={`btn w-full justify-start ${currentStatus === "going" ? "btn-success" : "btn-outline btn-success"}`}
            onClick={() => handleStatusClick("going")}
            disabled={isLoading("going") || (currentStatus !== "going" && isFull)}
          >
            {isLoading("going") ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Icon icon="lucide:check-circle" className="text-xl" />
            )}
            <span>Going</span>
          </button>
        </div>

        {/* Maybe Button */}
        <div className="tooltip" data-tip="I might come">
          <button
            className={`btn w-full justify-start ${currentStatus === "maybe" ? "btn-warning" : "btn-outline btn-warning"}`}
            onClick={() => handleStatusClick("maybe")}
            disabled={isLoading("maybe")}
          >
            {isLoading("maybe") ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Icon icon="lucide:help-circle" className="text-xl" />
            )}
            <span>Maybe</span>
          </button>
        </div>

        {/* Not Going Button */}
        <div className="tooltip" data-tip="Can't make it">
          <button
            className={`btn w-full justify-start ${currentStatus === "not_going" ? "btn-error" : "btn-outline btn-error"}`}
            onClick={() => handleStatusClick("not_going")}
            disabled={isLoading("not_going")}
          >
            {isLoading("not_going") ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Icon icon="lucide:x-circle" className="text-xl" />
            )}
            <span>Not Going</span>
          </button>
        </div>
      </div>

      {/* Remove RSVP link - only show if user has RSVP'd */}
      {currentRsvp && (
        <button
          className="btn btn-ghost btn-sm btn-block"
          onClick={handleCancelRSVP}
          disabled={loading}
        >
          <Icon icon="lucide:trash-2" className="text-lg" />
          Remove RSVP
        </button>
      )}
    </div>
  )
}
