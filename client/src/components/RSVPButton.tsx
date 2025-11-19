import { AlertCircle, CheckCircle, Clock, HelpCircle, Trash2, XCircle } from "lucide-react"
import { useState } from "react"

import type { RSVP, RSVPStatus } from "@server/types"

interface RSVPButtonProps {
  gameId: number
  userId: string
  currentRsvp: RSVP | undefined
  isFull: boolean
  isPast: boolean
  onRsvpChange: (rsvp: RSVP | null) => void
  onCapacityChange: (delta: number) => void
}

export default function RSVPButton({
  gameId,
  userId,
  currentRsvp,
  isFull,
  isPast,
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

  const currentStatus = currentRsvp?.status || null
  const isLoading = (status: RSVPStatus | null) => loading && currentStatus === status

  const isButtonDisabled = (status: RSVPStatus) => {
    return isLoading(status) || isPast || (isFull && currentStatus !== "going")
  }

  const getTooltipText = (status: RSVPStatus) => {
    if (isPast) return "Event has passed"
    if (isFull && currentStatus !== "going") return "Game is full"

    const tooltips: Record<RSVPStatus, string> = {
      going: "I'll be there!",
      maybe: "I might come",
      not_going: "Can't make it"
    }
    return tooltips[status]
  }

  const buttonConfigs: Array<{
    status: RSVPStatus
    label: string
    icon: typeof CheckCircle
    className: string
  }> = [
    { status: "going", label: "Going", icon: CheckCircle, className: "btn-success" },
    { status: "maybe", label: "Maybe", icon: HelpCircle, className: "btn-warning" },
    { status: "not_going", label: "Not Going", icon: XCircle, className: "btn-error" }
  ]

  // Handler for button clicks
  const handleStatusClick = async (status: RSVPStatus) => {
    if (!currentRsvp) {
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
        const errorMessage = err instanceof Error ? err.message : "Failed to RSVP"
        console.error("Failed to RSVP:", { gameId, userId, error: err })
        alert(`Failed to RSVP: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    } else {
      await handleUpdateRSVP(status)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {isPast && (
        <div className="alert alert-info">
          <Clock className="text-lg" />
          <span className="text-sm">This event has already passed</span>
        </div>
      )}

      {isFull && !currentRsvp && !isPast && (
        <div className="alert alert-warning">
          <AlertCircle className="text-lg" />
          <span className="text-sm">This game is full</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {buttonConfigs.map(({ status, label, icon: Icon, className }) => {
          const isActive = currentStatus === status
          const disabled = isButtonDisabled(status)

          return (
            <div key={status} className="tooltip" data-tip={getTooltipText(status)}>
              <button
                className={`btn w-full justify-start ${isActive ? className : `btn-outline ${className}`}`}
                onClick={() => handleStatusClick(status)}
                disabled={disabled}
              >
                {isLoading(status) ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Icon className="text-xl" />
                )}
                <span>{label}</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Remove RSVP link - only show if user has RSVP'd and event hasn't passed */}
      {currentRsvp && !isPast && (
        <button
          className="btn btn-ghost btn-sm btn-block"
          onClick={handleCancelRSVP}
          disabled={loading}
        >
          <Trash2 className="text-lg" />
          Remove RSVP
        </button>
      )}
    </div>
  )
}
