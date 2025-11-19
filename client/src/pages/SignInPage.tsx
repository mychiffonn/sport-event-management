import { AlertCircle, Code, Eye, EyeOff, Mail } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authClient } from "@/utils/auth-client"

export default function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password
      })

      if (error) {
        setError(error.message || "Failed to sign in")
      } else {
        navigate("/")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setError(null)
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/"
      })
    } catch {
      setError(`Failed to sign in with ${provider}`)
    }
  }

  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
          <p className="text-base-content/60 mt-2 text-sm">
            Welcome back! Please enter your details
          </p>
        </div>

        <div className="bg-base-100 rounded-lg p-8 shadow-sm">
          {error && (
            <div className="border-error/20 bg-error/10 text-error mb-4 flex items-center gap-2 rounded-md border p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-5">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
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

            <label htmlFor="password" className="text-sm font-medium">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input w-full rounded-md pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-base-content/50 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-full rounded-md" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                "Sign in"
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
              onClick={() => handleSocialSignIn("github")}
              className="btn btn-outline rounded-md"
            >
              <Code className="h-5 w-5" />
              GitHub
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
              className="btn btn-outline rounded-md"
            >
              <Mail className="h-5 w-5" />
              Google
            </button>
          </div>

          <p className="text-base-content/60 mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
