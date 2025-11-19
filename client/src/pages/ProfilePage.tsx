import { AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { authClient } from "@/utils/auth-client"

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Update name if changed
      if (name !== user?.name) {
        await authClient.updateUser({ name, image: user?.image })
      }

      // Update email if changed
      if (email !== user?.email) {
        await authClient.changeEmail({ newEmail: email })
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }
        if (newPassword.length < 8) {
          setError("Password must be at least 8 characters")
          setLoading(false)
          return
        }
        await authClient.changePassword({
          newPassword,
          currentPassword,
          revokeOtherSessions: false
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }

      setSuccess("Profile updated successfully!")
    } catch {
      setError("Failed to update profile. Check your current password if changing it.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>

      {success && (
        <div className="alert alert-success mb-4">
          <CheckCircle />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="input w-full rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input w-full rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="divider">Change Password (Optional)</div>

            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                placeholder="Required if changing password"
                className="input w-full rounded-md"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Leave blank to keep current"
                className="input w-full rounded-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
              />
              {newPassword && (
                <p className="text-base-content/60 text-xs">Must be at least 8 characters</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="input w-full rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full rounded-md"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
