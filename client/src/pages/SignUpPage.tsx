import { AlertCircle, Code, Eye, EyeOff, Mail } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authClient } from "@/utils/auth-client"

export default function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password
      })

      if (error) {
        setError(error.message || "Failed to sign up")
      } else {
        navigate("/")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignUp = async (provider: "github" | "google") => {
    setError(null)
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/"
      })
    } catch {
      setError(`Failed to sign up with ${provider}`)
    }
  }

  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
          <p className="text-base-content/60 mt-2 text-sm">Get started with your free account</p>
        </div>

        <div className="bg-base-100 rounded-lg p-8 shadow-sm">
          {error && (
            <div className="border-error/20 bg-error/10 text-error mb-4 flex items-center gap-2 rounded-md border p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailSignUp} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="input input-bordered w-full rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="input w-full rounded-md pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-base-content/50 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-base-content/60 text-xs">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="input w-full rounded-md pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-base-content/50 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full rounded-md" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="border-base-300 w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-base-100 text-base-content/60 px-2">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialSignUp("github")}
              className="btn btn-outline rounded-md"
            >
              <Code className="h-5 w-5" />
              GitHub
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignUp("google")}
              className="btn btn-outline rounded-md"
            >
              <Mail className="h-5 w-5" />
              Google
            </button>
          </div>

          <p className="text-base-content/60 mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
