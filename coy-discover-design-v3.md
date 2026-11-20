# Coy Discover Design Reference v3

This document summarizes the approved Coy Discover prototype in
`coy-discover-design-v3.html`. It is a reference for future implementation;
it does not authorize changes outside the requested frontend foundation phase.

## Prototype

- Prototype file: `coy-discover-design-v3.html`
- Visual direction: playful, warm, private-by-design dating experience
- Brand: `coy.`
- Primary accent: pink
- Supporting colors: lavender, peach, mint, white, and near-black
- Typography: Plus Jakarta Sans

## Shared layout

The prototype has:

- A compact top bar with the Coy logo, demo label, reset action, and account
  avatar.
- A pill-shaped navigation bar for Home, Discover, Matches, and My Profile.
- A centered content area.
- A footer with privacy and interaction information.

The navigation count for matches should be displayed only when matches exist.

## Frontend routes

The React foundation should map the approved design to these routes:

- `/` — Home placeholder
- `/discover` — Discover experience
- `/matches` — Mutual matches
- `/profile` — Profile management, if and when implemented
- Invalid route — Simple not-found page

Only the routes needed by each implementation phase should be activated.

## Home

The prototype shows a quiet welcome card with:

- A heart or mail-style visual
- A Coy-specific eyebrow
- “Home is a little quiet for now”
- A brief privacy explanation
- A button that enters Discover

Home is blank until the approved assignment explicitly requests home UI.

## Discover

The Discover design includes:

- A hero title and short subtitle
- A central profile card
- Photo area with a profile photo and photo count
- Name, age, verification label, city, and bio
- Interest chips
- Like and Pass controls
- Pointer drag/swipe interaction
- “Like” and “Pass” stamps during drag
- A side privacy panel
- Discovery progress
- How-to-use information
- Filter controls

These elements must not be implemented during the frontend foundation phase.

## Matches

The Matches design includes:

- A section heading and count
- A grid of mutual match cards
- Profile photo, name, age, city, and interests
- A placeholder message action
- An empty state when no matches exist

Mutual matches should remain private until a match is created.

## Profile

The prototype also contains a profile editor, but it is outside the current
backend and frontend implementation phases. It includes:

- Photo selection and primary photo
- Name
- Age
- City
- Bio
- Interest choices
- Desktop/mobile live preview

Do not implement My Profile or profile editing until explicitly requested.

## API compatibility

The existing backend response shape should be used without exposing private
fields:

- Discover: `GET /api/discover`
- Swipe: `POST /api/swipes`
- Test user: `x-user-id` header or `userId` query parameter

The frontend should not expose email addresses or other private backend fields.

## Scope rule

For future phases, implement the design through the existing React structure:

- `src/pages`
- `src/components`
- `src/layout`
- `src/services`
- `src/types`
- `src/hooks`

Do not redesign the Coy identity or invent a new visual system.
