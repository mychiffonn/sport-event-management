import { Link } from "react-router-dom"

interface AvatarProps {
  userId: number
  userName?: string
  borderColor?: string
  size?: "sm" | "md" | "lg"
}

export default function Avatar({ userId, userName, borderColor = "", size = "md" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8",
    md: "w-10",
    lg: "w-12"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <Link to={`/users/${userId}`} className="avatar" title={userName || "Unknown"}>
      <div
        className={`${sizeClasses[size]} rounded-full border-2 ${borderColor} bg-neutral text-neutral-content flex items-center justify-center transition-transform hover:scale-110`}
      >
        {userName ? (
          <span className={`${textSizeClasses[size]} font-semibold`}>
            {userName.charAt(0).toUpperCase()}
          </span>
        ) : (
          <span className={textSizeClasses[size]}>?</span>
        )}
      </div>
    </Link>
  )
}
