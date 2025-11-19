import { betterAuth } from "better-auth"
import { Pool } from "pg"

const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: new Pool({
    connectionString,
    ssl: process.env.PGHOST?.includes("render.com") ? { rejectUnauthorized: false } : undefined
  }),
  trustedOrigins: ["http://localhost:5173"],
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
