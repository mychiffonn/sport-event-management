# ⚽ Sport Connect

**A community platform for organizing and joining recreational sports events**

**Designed and developed by:** Emanuel Pimentel, My "Chiffon" Nguyen

🔗 **Deployed App:** Coming soon!

---

## 📑 Table of Contents

- [About](#about)
- [Features](#features)
- [Installation Instructions](#installation-instructions)
- [Available Scripts](#available-scripts)
- [Recommended Project Structure](#recommended-project-structure)

---

## About

### Description and Purpose

This web application will allow users to set up and organize their own recreational sport events at their community parks. The purpose of this is to make it easier for people to get together and enjoy some outdoor time.

### Inspiration

For many, trying to make new friends in your area can be difficult, especially when it comes to finding a shared hobby or interest. With this website, users can now host weekly or daily events that brings everyone together through recreational sports, making finding friends and being active easier.

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

The user can update their RSVP status for an event they have already RSVP'd to. Options: "Going", "Maybe", "Not Going"

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

3. Create a `.env` file in the root directory and fill in environment variables

   ```bash
   cp .env.example .env
   ```

4. Initialize the database:

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
  │   ├── types.d.ts                # Endpoint types (e.g., game, rsvp)
  │   └── server.ts
  └── package.json
```

- **TypeScript Project References**: Root tsconfig with client/server separation
- **Path Aliases**: `@/` for client imports (e.g., `import { foo } from '@/components'`)
- **ESM Everything**: All configs use modern ES modules

## Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![DaisyUI](https://img.shields.io/badge/DaisyUI-5.5.5-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Backend

![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-24.8.0-339933?style=for-the-badge&logo=node.js&logoColor=white)

### Development Tools

![ESLint](https://img.shields.io/badge/ESLint-9.39.1-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-3.6.2-F7B93E?style=for-the-badge&logo=prettier&logoColor=black) ![pnpm](https://img.shields.io/badge/pnpm-10.21.0-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
