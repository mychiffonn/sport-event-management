import { createContext, useContext, type ReactNode } from "react"
import { authClient } from "@/utils/auth-client"

interface Account {
  id: string
  provider: string
  providerId: string
}

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
  accounts?: Account[]
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

// Helper function to check if user has email/password authentication
export function hasPasswordAuth(user: User | null): boolean {
  if (!user?.accounts || user.accounts.length === 0) {
    // If no accounts info, assume email/password (backward compatibility)
    return true
  }

  // Check if user has credential (email/password) account
  return user.accounts.some((account) => account.provider === "credential")
}
