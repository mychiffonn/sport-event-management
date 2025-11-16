import { Link } from "react-router-dom"

export function Navbar() {
  // TODO: this will come from auth context later
  const isLoggedIn = true // placeholder
  const userName = "John Doe" // Placeholder

  return (
    <nav className="navbar bg-base-100 px-4 shadow-lg">
      <div className="flex-1">
        {/* Logo / Site Name */}
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          ⚽ Sport Connect
        </Link>

        {/* Navigation Links */}
        <div className="ml-8 flex gap-2">
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
          <Link to="/games" className="btn btn-ghost">
            Browse Games
          </Link>
          <Link to="/games/new" className="btn btn-ghost">
            Create Game
          </Link>
        </div>
      </div>

      {/* Right side - Profile or Login */}
      <div className="flex-none">
        {isLoggedIn ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content w-10 rounded-full">
                <span className="text-xl">{userName.charAt(0)}</span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li className="menu-title">
                <span>{userName}</span>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/my-events">Your Events</Link>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a className="text-error">Logout</a>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
