# Coy Discover

Coy Discover is a full-stack React and Express internship assignment featuring profile
discovery, private one-way likes, mutual matches, and a live My Profile editor.

The interface follows the local V3 prototype (`coy-discover-design-v3.html`) and uses
a privacy-first, Coy-inspired visual style.

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

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the backend

Copy `server/.env.example` to `server/.env` if needed:

```bash
PORT=5000
```

The backend falls back to port `5000`.

### 3. Configure the frontend

Copy `client/.env.example` to `client/.env` if needed:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

The frontend falls back to `http://localhost:5000`.

## Running the Application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

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

## Temporary Test User

Authentication is not implemented yet. For development, APIs accept:

```text
x-user-id: 1
```

The default test user is ID `1`. The frontend currently sends this header for Discover,
Swipe, Matches, and Profile requests.

This is temporary and must be replaced with authenticated server identity before production.

## Pages

- `/` - Home
- `/discover` - One-at-a-time profile discovery
- `/matches` - Mutual matches
- `/profile` - Edit the current profile
- Invalid routes - Not-found page

## API Endpoints

### Health

```text
GET /health
```

### Discover

```text
GET /api/discover?limit=30&offset=0
Header: x-user-id: 1
```

### Swipe

```text
POST /api/swipes
Header: x-user-id: 1
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
Header: x-user-id: 1
```

### Profile

```text
GET /api/profile
PUT /api/profile
POST /api/profile/photo
DELETE /api/profile/photo
Header: x-user-id: 1
```

Profile photos support JPEG, PNG and WebP files up to 5 MB. Uploads are stored on disk
outside SQLite.

## Database

SQLite database files are created under `server/data/`.

The database contains:

- `users`
- `profiles`
- `swipes`
- `matches`

Existing records are preserved across application restarts.

## Privacy

- Likes are private until a mutual match exists.
- Discover responses exclude the current user and already-swiped profiles.
- Matches return only mutual pairs.
- Profile and match responses exclude email addresses.
- Test-user identity is for development only and is not authentication.

## Current Scope

The project includes:

- Home, Discover, Matches and My Profile
- Profile cards
- Like/Pass buttons
- Drag swipe gestures
- Mutual-match feedback
- Matches with loading, error and empty states
- Profile editing and live preview
- Single-photo upload, replacement and removal

Authentication, messaging, reporting/blocking and swipe quotas are not implemented.
