# Joy

Joy is a privacy-first dating app with phone-based sign-in, profile discovery, mutual
matches, and private conversations. Its welcoming pink-and-lavender interface keeps the
existing swipe experience while adding inclusive match preferences, onboarding, and
community interest trends.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- SQLite through `better-sqlite3`
- Zod
- Multer for profile-photo uploads
- JWT sessions in HTTP-only cookies

## Project Structure

```text
coy-discover/
├── client/
│   └── src/
│       ├── components/
│       ├── layout/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── types/
├── server/
│   ├── public/uploads/profiles/
│   └── src/
│       ├── controllers/
│       ├── data/
│       ├── database/
│       ├── middleware/
│       ├── routes/
│       └── services/
├── coy-discover-design-v3.html
└── coy-discover-design-v3.md
```

## Setup

### 1. Install dependencies

Use Node.js 22 or newer.

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the backend

Copy `server/.env.example` to `server/.env`, then set `JWT_SECRET` to a random
secret of at least 32 characters:

```bash
PORT=5000
JWT_SECRET=replace-with-a-random-secret
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Generate a signing secret with
`node -p "require('node:crypto').randomBytes(32).toString('hex')"` and keep it private.
The backend falls back to port `5000`. If `JWT_SECRET` is omitted during local
development, the server creates a temporary secret and sessions expire when it restarts.

### 3. Configure the frontend

The Vite development proxy connects the client to the API. Leave
`VITE_API_BASE_URL` empty in `client/.env` to keep the authentication cookie same-origin.
If you set a custom API URL, use the same host name for both the client and API.

```bash
VITE_API_BASE_URL=
```

## Running the Application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the client in another terminal:

```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

Open the frontend and sign in with a phone number in international format, such as
`+919876543210`. This project has **no SMS provider integration**: use the local code
`12345` (also printed to the backend terminal). Codes expire after five minutes, are
limited to five attempts, and can be requested once per minute. Phone-code login is
disabled when `NODE_ENV=production`; configure an SMS provider before production use.

## Build Commands

Build the frontend:

```bash
cd client
npm run build
```

Build the backend:

```bash
cd server
npm run build
```

Start the compiled backend:

```bash
cd server
npm start
```

Run the backend integration test:

```bash
cd server
npm test
```

## Sign-in and Matching

- A phone code starts either a session or first-time profile setup.
- The backend signs a JWT and sets it in an HTTP-only cookie; the browser does not store
  the token in local storage.
- Profile gender identity is separate from “Show me” preferences.
- A profile is discoverable only when both users' preferences include each other.
- Likes stay private; only mutual likes create a match.
- Messages are available only to members of that match. The client refreshes chats every
  three seconds.
- Trending interests count recent likes over seven days and are shown only after at least
  three members like at least three profiles with the same interest. Individual profiles
  are never ranked.

## Pages

- `/` - Home
- `/login` - Phone sign-in
- `/onboarding` - First-time profile setup
- `/discover` - Preference-filtered profile discovery
- `/matches` - Mutual matches
- `/matches/:matchId` - Private conversation
- `/trending` - Community interest trends and conversation starters
- `/profile` - Edit profile and match preferences
- Invalid routes - Not-found page

## API Endpoints

### Health

```text
GET /health
```

### Authentication

```text
POST /api/auth/request-code
POST /api/auth/verify-code
POST /api/auth/complete-profile
GET  /api/auth/state
POST /api/auth/logout
```

Authentication uses an HTTP-only `coy_session` cookie. In development the OTP appears
only in the backend console. The current implementation does not send SMS or verify a
number with a third-party provider.

### Discover

```text
GET /api/discover?limit=30&offset=0
Cookie: coy_session=<JWT>
```

### Swipe

```text
POST /api/swipes
Cookie: coy_session=<JWT>
Content-Type: application/json

{
  "targetUserId": 2,
  "action": "like"
}
```

`action` accepts `like` or `pass`.

### Matches

```text
GET /api/matches
Cookie: coy_session=<JWT>
```

### Profile

```text
GET /api/profile
PUT /api/profile
POST /api/profile/photo
DELETE /api/profile/photo
Cookie: coy_session=<JWT>
```

Profile photos support JPEG, PNG and WebP files up to 5 MB. Uploads are stored on disk
outside SQLite.

### Messaging and trends

```text
GET  /api/matches/:matchId/messages
POST /api/matches/:matchId/messages
GET  /api/trending
```

Message routes verify that the signed-in user belongs to the requested mutual match.

## Database

SQLite database files are created under `server/data/`.

The database contains:

- `users`
- `profiles`
- `swipes`
- `matches`
- `messages`
- `otp_challenges`

Existing records are preserved across application restarts.

## Privacy

- Likes are private until a mutual match exists.
- Discover responses exclude the current user and already-swiped profiles.
- Matches return only mutual pairs.
- Profile and match responses exclude email addresses.
- Phone numbers are stored for account lookup and are never included in public profile
  responses.
- Use a long, unique `JWT_SECRET` and HTTPS in production.

## Current Scope

The project includes:

- Phone-code sign-in for local development and JWT sessions
- First-time profile setup and gender-based mutual preferences
- Home, Discover, Matches, Trending and My Profile
- Profile cards
- Like/Pass buttons
- Drag swipe gestures
- Mutual-match feedback
- Mutual-match-only private messaging
- Trending interests with privacy thresholds and conversation prompts
- Responsive mobile navigation and layouts
- Profile editing and live preview
- Single-photo upload, replacement and removal

An SMS delivery provider, account recovery, reporting/blocking, moderation tools, and
message notifications are not implemented. Do not deploy the console OTP flow to production.
