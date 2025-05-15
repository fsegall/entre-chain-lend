# Entre-Chain Lend Frontend

This is the frontend application for Entre-Chain Lend, a decentralized lending platform built with React, TypeScript, and Supabase.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase Auth
- React Router
- React Query

## Prerequisites

- Node.js 18+ 
- npm or bun

## Setup

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Create a `.env` file in the frontend directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AUTH_REDIRECT_URL=http://localhost:8080/auth-callback
```

3. Start the development server:
```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── integrations/  # Third-party service integrations
│   ├── pages/         # Page components
│   └── utils/         # Utility functions
├── public/            # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Authentication

The application uses Supabase Authentication with the following features:
- Email/Password authentication
- Google OAuth
- Role-based access control (Borrower/Lender)

## Development Guidelines

1. Follow the TypeScript strict mode guidelines
2. Use functional components with hooks
3. Implement proper error handling
4. Write meaningful component and function documentation
5. Follow the established project structure

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT 