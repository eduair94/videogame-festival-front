# 🎮 Videogame Festival Frontend

A modern, responsive web application for discovering indie game festivals, showcases, awards, and Steam featuring opportunities. Built with Next.js 16, React 19, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.0.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss)

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| **Frontend** | [https://videogame-festival-front.vercel.app/](https://videogame-festival-front.vercel.app/) |
| **Backend API** | [https://videogame-events-api.vercel.app/](https://videogame-events-api.vercel.app/) |
| **API Docs (Swagger)** | [https://videogame-events-api.vercel.app/docs](https://videogame-events-api.vercel.app/docs) |

## 📦 Related Repositories

| Repository | Description |
|------------|-------------|
| [videogame-events-api](https://github.com/eduair94/videogame-events-api) | Backend API - RESTful API for festival data, built with Node.js and MongoDB |
| [videogame-festival-front](https://github.com/eduair94/videogame-festival-front) | Frontend Application (this repo) |

## ✨ Features

- 🎮 **Festival Data**: Browse curated indie game festivals with filtering, sorting, and pagination
- 📊 **Steam Feature Tracking**: Track which festivals have been featured on Steam
- 🔄 **Data Sync**: Automatically syncs data from CSV files to MongoDB via the backend API
- 📈 **Statistics**: Get insights about festival types, open submissions, and more
- 🚀 **RESTful API**: Clean, well-documented REST endpoints with Swagger documentation
- 🔍 **Advanced Filtering**: Filter by event type, search by name, and sort results
- ⏰ **Deadline Tracking**: Visual indicators for submission deadlines with urgency levels
- 📱 **Responsive Design**: Fully responsive UI optimized for all devices
- 🎨 **Modern UI**: Beautiful dark theme with gradient accents and smooth animations

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Headless UI](https://headlessui.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)

### Backend (Separate Repository)
- **Runtime**: Node.js 18+
- **Database**: MongoDB
- **API Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eduair94/videogame-festival-front.git
cd videogame-festival-front
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3561](http://localhost:3561) with your browser to see the result.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3561 |
| `npm run build` | Build for production |
| `npm run start` | Start production server on port 3561 |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with events grid
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Loading state
│   ├── not-found.tsx      # 404 page
│   └── events/
│       └── [id]/
│           └── page.tsx   # Event detail page
├── components/            # React components
│   ├── EventCard.tsx      # Individual event card
│   ├── EventsGrid.tsx     # Grid of event cards
│   ├── FilterBar.tsx      # Search and filter controls
│   ├── Header.tsx         # Site header with navigation
│   ├── Footer.tsx         # Site footer
│   └── StatsBar.tsx       # Statistics display
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   └── utils.ts          # Helper utilities
└── types/                 # TypeScript type definitions
    └── index.ts          # Festival, SteamFeature, etc.
```

## 🔌 API Integration

The frontend connects to the backend API at `https://videogame-events-api.vercel.app`. Key endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/festivals` | List all festivals (with pagination, filtering) |
| `GET /api/festivals/:id` | Get festival by ID |
| `GET /api/festivals/stats` | Get festival statistics |
| `GET /api/festivals/types` | Get all festival types |
| `GET /api/festivals/open` | Get festivals with open submissions |
| `GET /api/festivals/upcoming` | Get upcoming festivals |
| `GET /api/steam-features` | Get Steam featuring history |

## 📊 Data Source

Festival data is sourced from a curated [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1NGseGNHv6Tth5e_yuRWzeVczQkzqXXGF4k16IsvyiTE/edit?usp=drivesdk) maintained by the community.

## 🚢 Deployment

The application is deployed on [Vercel](https://vercel.com). Every push to the `master` branch triggers an automatic deployment.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/eduair94/videogame-festival-front)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Eduardo Aira** - [@eduair94](https://github.com/eduair94)

---

<p align="center">
  Made with ❤️ for the indie game development community
</p>
