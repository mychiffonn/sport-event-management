import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { formatLongDate } from "@/utils/format-date"

import { api } from "@/services/api"

interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return

      try {
        setLoading(true)
        const userData = await api.getUser(Number(userId))
        setUser(userData)
        setError(null)
      } catch {
        setError("Failed to load user profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error || "User not found"}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 container mx-auto mt-8 p-4 shadow-sm">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content w-20 rounded-full">
              <span className="text-3xl font-semibold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div>
            <h1 className="card-title text-3xl">{user.name}</h1>
            <p className="text-base-content/70">{user.email}</p>
            <div>
              <span className="font-semibold">Member since: </span>
              <span>{formatLongDate(user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
