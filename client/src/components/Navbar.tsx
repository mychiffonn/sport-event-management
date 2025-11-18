import { Calendar, LogOut, Plus, Search, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { authClient } from "@/utils/auth-client"

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const userName = user?.name || "User"

  // ✏️ ADDED: Handler to clear filters
  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate("/", { replace: true })
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/", { replace: true })
        }
      }
    })
  }

  return (
    <nav className="navbar bg-base-100 px-4 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          ⚽ SportConnect
        </Link>
      </div>

      {/* Right side - Nav buttons + Profile */}
      <div className="flex flex-none items-center gap-2">
        <ul className="menu menu-horizontal gap-1 px-1">
          <li>
            <button onClick={handleBrowseClick} className="btn btn-ghost btn-sm">
              <Search className="h-4 w-4" />
              Browse
            </button>
          </li>
          <li>
            <Link to="/games/new" className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </li>
        </ul>

        {/* Profile or Login */}
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="avatar avatar-placeholder btn btn-circle btn-ghost"
            >
              <div className="bg-neutral text-neutral-content w-10 rounded-full">
                <span className="text-lg">{userName.charAt(0)}</span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg"
            >
              <li className="menu-title">
                <span>{userName}</span>
              </li>
              <li>
                <Link to="/me">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/my-games">
                  <Calendar className="h-4 w-4" />
                  Your Events
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/signin" className="btn btn-sm btn-primary btn-outline">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-ghost btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
