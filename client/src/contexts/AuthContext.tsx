import { createContext, useContext, type ReactNode } from "react"
import { authClient } from "@/utils/auth-client"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
}

interface Session {
  user: User
  session: {
    token: string
    expiresAt: Date
  }
}

interface AuthContextType {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  isPending: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  const value: AuthContextType = {
    session: session || null,
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isPending
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
