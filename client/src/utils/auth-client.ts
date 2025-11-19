import { createAuthClient } from "better-auth/react"

const getAuthBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  return import.meta.env.MODE === "production" ? window.location.origin : "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: {
    credentials: "include"
  }
})

export const { useSession, signIn, signOut, signUp } = authClient
