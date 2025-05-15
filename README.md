# Entre-Chain Lend

A decentralized lending platform built with React, TypeScript, and Supabase.

## Project Structure

The project is organized into two main directories:

### Frontend (`/frontend`)
Contains the React/Vite application. See [frontend/README.md](frontend/README.md) for detailed setup instructions.

### Supabase (`/supabase`)
Contains all Supabase-related configurations:
- Database migrations
- Edge Functions
- Database policies and triggers
- Type definitions

## Getting Started

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   # Create .env file with required variables
   npm run dev
   ```
3. Set up Supabase:
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` directory
   - Configure environment variables in the frontend

## Development

- Frontend development: See [frontend/README.md](frontend/README.md)
- Database changes: Add new migrations in `supabase/migrations`
- Edge Functions: Add new functions in `supabase/functions`

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT

## Project info

**URL**: https://lovable.dev/projects/a99d5196-aa46-4ea6-ab0d-4c180ea1542d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a99d5196-aa46-4ea6-ab0d-4c180ea1542d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a99d5196-aa46-4ea6-ab0d-4c180ea1542d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
