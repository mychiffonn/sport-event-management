## Sports-events Management

**Designed and developed by:** Emanuel Pimentel, My "Chiffon" Nguyen

🔗 Link to deployed app:

## About

### Description and Purpose

This web application will allow users to set up and organize their own recreational sport events
at their community parks. The purpose of this is to make it easier for people to get together
and enjoy some outdoor time.

### Inspiration

For many, trying to make new friends in your area can be difficult, especially when it comes to finding a shared hobby
or interest. With this website, users can now host weekly or daily events that brings everyone together through recreational sports, making finding
friends and being active easier.

## Tech Stack

Frontend: React, TailwindCSS, daisyUI, shadcn/ui

Backend: Express, PostgreSQL

Deploy: Render

## Features

### View all available games

First feature will allow the user to view all the available games

[gif goes here]

### Create a new game

Second feature will allow the user to create a new recreational game event. It will be validated

[gif goes here]

### Update game details (time, location, activity)

Third feature will allow the user to make any changes in regards to the event such as time, location, activity

[gif goes here]

### Delete a game

Fourth feature will allow the user to delete a game

[gif goes here]

### View game attendees

Under the events description, users can check who the attendees are

[gif goes here]

### RSVP to a Game

Users can RSVP to an event they see, given the availability

[gif goes here]

### Update RSVP status

The owner can let others know whether they've been confirmed, wailisted, or rejected

[gif goes here]

### Ability to cancel RSVP

Users can delete an event or undo their RSVP to an event

[gif goes here]

### Filter

Users can filter games by sport type, location, date.

This is a custom feature for: The user can filter or sort items based on particular criteria as appropriate for your use case.

### Prevent RVSP if the game is full

Validate game date is in future, prevent RSVP if game is full

This is a custom feature for: Data submitted via a POST or PATCH request is validated before the database is updated

## Installation Instructions

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v10 or higher) - Install with `npm install -g pnpm` (or use npm/yarn)
- PostgreSQL database, will be hosted on Render for deployment

### Setup

1. Clone the repository
2. Install dependencies

   ```bash
   pnpm install
   ```

3. Configure environment variables

   Create a `.env` file in the root directory (use `.env.example` as template):

   ```bash
   cp .env.example .env
   ```

4. **Initialize the database**

   ```bash
   pnpm reset
   ```

   This will create the necessary tables and seed initial data.

5. Start the development servers
   ```bash
   pnpm dev
   ```
   This starts both the client (on http://localhost:5173) and server (on http://localhost:3000) concurrently.

### Available Scripts

- `pnpm dev` - Start both client and server in development mode (uses concurrently)
- `pnpm dev:client` - Start only the client dev server
- `pnpm dev:server` - Start only the server in watch mode
- `pnpm build` - Build the client for production
- `pnpm build:server` - Build server TypeScript to JavaScript
- `pnpm start` - Start the server in production mode
- `pnpm reset` - Reset and seed the database
- `pnpm lint` - Run ESLint on entire codebase
- `pnpm lint:fix` - Run ESLint and auto-fix issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check if files are formatted correctly

### Recommended Project Structure

```
sport-connect/
  ├── client/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── auth/           # Login, Register, etc.
  │   │   │   ├── games/          # GameList, GameCard, CreateGame
  │   │   │   ├── rsvps/          # RSVPButton, RSVPList
  │   │   │   └── common/         # Navbar, Footer, etc.
  │   │   ├── pages/              # Home, GameDetail, Profile, etc.
  │   │   ├── hooks/              # useAuth, useGames, etc.
  │   │   ├── services/
  │   │   │   └── api.ts          # Axios/fetch wrapper
  │   │   ├── lib/
  │   │   │   └── auth.ts         # BetterAuth client
  │   │   ├── types/              # Client-specific types
  │   │   └── App.tsx
  │   └── vite.config.ts
  ├── server/
  │   ├── lib/
  │   │   └── auth.ts             # BetterAuth server setup
  │   ├── routes/
  │   │   ├── auth.ts             # BetterAuth routes
  │   │   ├── games.ts
  │   │   ├── rsvps.ts
  │   │   └── users.ts            # User profile routes
  │   ├── controllers/
  │   │   ├── games.ts
  │   │   ├── rsvps.ts
  │   │   └── users.ts
  │   ├── db/                     # Instead of config/
  │   │   ├── pool.ts
  │   │   ├── schema.sql
  │   │   └── seed.sql
  │   ├── types.ts                # Endpoint types (e.g., game, rsvp)
  │   └── server.ts
  ├── shared/                     # Shared between client/server
  │   └── types/
  │       ├── user.ts
  │       ├── game.ts
  │       └── rsvp.ts
  └── package.json
```

- **TypeScript Project References**: Root tsconfig with client/server separation
- **Path Aliases**: `@/` for client imports (e.g., `import { foo } from '@/components'`)
- **ESM Everything**: All configs use modern ES modules
