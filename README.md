# ⚽ Sport Connect

**A community platform for organizing and joining recreational sports events**

**Designed and developed by:** Emanuel Pimentel, My "Chiffon" Nguyen

🔗 **Deployed App:** (https://sport-connect-ccmg.onrender.com/)

---

## About

### Description and Purpose

This web application will allow users to set up and organize their own recreational sport events at their community parks. The purpose of this is to make it easier for people to get together and enjoy some outdoor time.

### Inspiration

For many, trying to make new friends in your area can be difficult, especially when it comes to finding a shared hobby or interest. With this website, users can now host weekly or daily events that brings everyone together through recreational sports, making finding friends and being active easier.

## Features

### 0. User Authentication

There are three options to sign up or log in:

- GitHub,
- Google,
- Email and Password.

This allows users to easily create an account and start using the website.

Features marked with [PROTECTED] require the user to be logged in to access them.

### 1. View all available games

Users can view all the available sport games

![CanViewAllGames](https://github.com/user-attachments/assets/9110c3a5-2df7-4a72-9f23-33f95971ec60)

### 2. Create a new game [PROTECTED]

Users can create a new sport game event. It will be validated so that they cannot create an event with invalid data. For example:

- past date,
- missing fields (e.g. no location, no time, etc.)
- capacity less than 2 people

![CreateNewGame](https://github.com/user-attachments/assets/d18c2cc3-f5dc-4797-a647-1c916364935c)

### 3. Update game details (time, location, activity) [PROTECTED]

Logged in users can edit the details of a game they created. This includes changing the time, location, and activity of the game. The form will be pre-filled with the current details of the game for easy editing.

They CANNOT reduce the capacity of the game to less than the number of attendees already RSVP'd to the game.

![EditGameDetails](https://github.com/user-attachments/assets/1a34954c-4925-4ab7-824a-fa815870a91c)

### 4. Delete a game [PROTECTED]

Logged in users can delete a game they created.

![DeleteGame](https://github.com/user-attachments/assets/39571047-af89-488f-b9bc-1f0ad3858ad8)

### 5. View game attendees

Under the events description, users can check who the attendees are

![ViewParti](https://github.com/user-attachments/assets/9cba258b-1cd0-4c00-bb81-e56939d5dd0c)

### 6. RSVP to a Game [PROTECTED]

Logged-in, non-host users can RSVP to a game they are interested in attending. They can select from three options: "Going", "Maybe", or "Not Going".

The number of attendees will be updated in real-time as users RSVP as 'Going' or 'Not Going'. If the game is full, users will not be able to RSVP.

![UpdateRSVP](https://github.com/user-attachments/assets/6ca8f2af-c316-4bf2-86d3-ac47641e24d3)

### 7. Update RSVP status [PROTECTED]

The user can update their RSVP status for an event they have already RSVP'd to. Options: "Going", "Maybe", "Not Going"

**Same as RSVP to a Game GIF**

### 8. Cancel RSVP [PROTECTED]

Users can delete an event or undo their RSVP to an event

**Same as RSVP to a Game GIF**

### 9. Prevent RVSP

Users cannot RSVP to a game if

- the number of attendees has reached the maximum capacity, UNLESS they RSVPed as "Going" before the game reached capacity. In this case, they can change their RSVP status freely, but they cannot change it to "Going" if the game is already full.
- the game date has already passed. RSVP buttons are disabled
- they have already RSVP'd to the game
- they are the host of the game

This is a custom feature for: Data submitted via a POST or PATCH request is validated before the database is updated

![PreventRSVPIfFull](https://github.com/user-attachments/assets/e9d6bf1a-ca41-4783-9a48-995429a70fa3)

### 10. Filter games

Users can filter games by sport type, location, date.

This is a custom feature for: The user can filter or sort items based on particular criteria as appropriate for your use case.

![Game Filter](https://github.com/user-attachments/assets/31220c9d-d04b-4ed1-823a-6f06501617c4)

## Installation Instructions

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v10 or higher) - Install with `npm install -g pnpm` (or use npm/yarn)
- Prepare `.env` with the same variables as `.env.example`
  - PostgreSQL database credentials from Render or your local setup
  - GitHub and Google OAuth credentials. Follow this [guide](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) to create a GitHub OAuth app and get the client ID and secret. Follow this [guide](https://support.google.com/cloud/answer/15549257?hl=en) to create a Google OAuth app and get the client ID and secret.
  - ⚠️ Note that you might have to create two separate Github OAuth apps for development and production environments, as the homepage and callback URLs will differ.

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

See [package.json](./package.json) for all available scripts. Key commands include:

- `pnpm dev` - Start both client and server in development mode (uses concurrently)
- `pnpm dev:client` - Start only the client dev server
- `pnpm dev:server` - Start only the server in watch mode
- `pnpm build` - Build the client for production
- `pnpm start` - Start the server in production mode
- `pnpm reset` - Reset and seed the database
- `pnpm lint` - Run ESLint on entire codebase
- `pnpm lint:fix` - Run ESLint and auto-fix issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check if files are formatted correctly

### Project Structure

```
sport-connect/
  ├── client/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── auth/           # Login, Register, etc.
  │   │   │   ├── games/          # GameList, GameCard, CreateGame
  │   │   │   ├── rsvps/          # RSVPButton, RSVPList
  │   │   │   └── common/         # Navbar, Footer, etc.
  |   |   ├── layouts/            # Layout with navbar, footer, transition
  │   │   ├── pages/              # Home, GameDetail, Profile, etc.
  │   │   ├── services/
  │   │   │   └── api.ts          # Axios/fetch wrapper
  │   │   ├── utils/              # Helper functions (date, auth, etc.)
  │   │   ├── contexts/           # AuthContext
  │   │   ├── constants/          # Constants like sport types
  │   │   └── App.tsx
  │   └── vite.config.ts
  ├── server/
  │   ├── lib/
  │   │   └── auth.ts             # BetterAuth server setup
  │   ├── routes/
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
  │   ├── types.d.ts              # Endpoint types (e.g., game, rsvp)
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
