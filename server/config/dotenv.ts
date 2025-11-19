import path from "path"
import { fileURLToPath } from "url"

import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment-specific file
const isProduction = process.env.NODE_ENV === "production"
const envFile = isProduction ? ".env.production.local" : ".env"

// Check if we're running from dist folder (production) or source folder (development)
const isRunningFromDist = __dirname.includes("/dist/")
const levelsUp = isRunningFromDist ? "../../../" : "../../"
const envPath = path.join(__dirname, levelsUp, envFile)

dotenv.config({ path: envPath })
