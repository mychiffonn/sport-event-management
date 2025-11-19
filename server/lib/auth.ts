import { betterAuth } from "better-auth"
import { Pool } from "pg"

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`

const getTrustedOrigins = (): string[] => {
  const origins = ["http://localhost:5173"]

  if (process.env.CLIENT_URL) {
    origins.push(process.env.CLIENT_URL)
  }

  return origins
}

const getBaseURL = (): string => {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000"
  return baseURL
}

export const auth = betterAuth({
  baseURL: getBaseURL(),
  database: new Pool({
    connectionString,
    ssl: process.env.PGHOST?.includes("render.com") ? { rejectUnauthorized: false } : undefined
  }),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || ""
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }
  },
  user: {
    changeEmail: {
      enabled: true
    }
  }
})
