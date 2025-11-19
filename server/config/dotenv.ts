import path from "path"
import { fileURLToPath } from "url"

import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment-specific file
const isProduction = process.env.NODE_ENV === "production"
const envFile = isProduction ? ".env.production.local" : ".env"
const envPath = path.join(__dirname, "../../../", envFile)

dotenv.config({ path: envPath })
