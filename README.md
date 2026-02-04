# ResQ Meal

A web platform connecting restaurants and food establishments with NGOs and volunteers to efficiently redistribute surplus food and combat hunger.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL

## Quick Start

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
# Configure .env with database credentials
npm start
```

## Project Structure

```
resqmeal-nourishing-communities/
├── src/                    # Frontend source code
│   ├── pages/             # Page components (App, Dashboard)
│   ├── components/        # Reusable UI components
│   ├── context/           # React context (LanguageContext)
│   ├── services/          # API integration
│   ├── lib/               # Utility functions
│   └── assets/            # Images, logos
├── backend/               # Backend API
│   ├── routes/           # API routes
│   ├── controllers/       # Business logic
│   ├── config/           # Database schema & seed data
│   └── middlewares/       # Auth middleware
├── public/               # Static assets
└── package.json          # Dependencies
```

## Features

- **One-Click Surplus Posting**: Restaurants post excess food instantly
- **Smart Matching Engine**: Automatic NGO matching based on location, capacity, and demand
- **Food Safety Validation**: Countdown timers and quality verification
- **Live Impact Tracking**: Real-time metrics on meals saved and CO₂ impact
- **Dark Mode & Multilingual**: Support for English, Tamil, and Hindi with dark mode
- **Responsive Design**: Works seamlessly on mobile and desktop

## Development

### Running Frontend
```bash
npm run dev
```
Server runs on `http://localhost:5173`

### Running Backend
```bash
cd backend
npm start
```
API runs on `http://localhost:5000`

## Environment Setup

Create `.env` in the backend directory:
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=resqmeal_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

## UI Design System

- **Primary**: Deep Teal (#0F766E)
- **Secondary**: Slate Blue (#334155)
- **Accent**: Soft Amber (#F59E0B)
- **Success**: Sage Green (#16A34A)
- **Background**: White (#FFFFFF)

## License

MIT
