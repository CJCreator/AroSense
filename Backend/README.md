# AroSense Backend

This is a Node.js + Express backend for the AroSense app. It uses SQLite for local development and provides REST API endpoints for users, family members, baby logs, wellness logs, rewards, and authentication.

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. The API will be available at `http://localhost:3000/api/`

## Example Endpoints
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/health` - Health check

## Customization
- Add more tables and endpoints in `index.js` as needed for your app features.

## Copilot Instructions
See `.github/copilot-instructions.md` for workspace-specific instructions.
