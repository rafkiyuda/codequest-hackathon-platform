# CodeQuest Hackathon Platform

The official platform for the CodeQuest Hackathon, managing participant registration, team formation, submissions, and event information.

## Project Structure

This repository is a monorepo containing both the frontend and backend applications:

- **[Frontend](./frontend/README.md)**: Built with Astro and TailwindCSS. Handles the landing page, participant dashboard, and admin interface.
- **[Backend](./backend/README.md)**: Built with Node.js, Express, and Prisma. Manages the API, database, and authentication.

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd codequest-hackathon-platform
    ```

2.  **Install dependencies:**
    ```bash
    cd frontend && npm install
    cd ../backend && npm install
    ```

3.  **Setup Environment:**
    - Configure `.env` in `backend/` (see [Backend README](./backend/README.md)).
    - Configure `.env` in `frontend/` (optional, see [Frontend README](./frontend/README.md)).

4.  **Run Development Servers:**
    - **Backend:** `cd backend && npm run dev` (Runs on port 3000)
    - **Frontend:** `cd frontend && npm run dev` (Runs on port 4321)

## Documentation

For detailed instructions on setup, deployment, and features, please refer to the specific README files in each directory:

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.
