# Checkin

A mobile-first Next.js frontend for office attendance check-in/out using a printed QR code. The app runs fully on mock data by default and can be switched to a real API later.

## Getting started

1. Copy the environment file and fill in values for local development:

```
cp .env.example .env.local
```

2. Install dependencies:

```
npm install
```

3. Start the dev server:

```
npm run dev
```

## Environment configuration

All configuration comes from environment variables in `.env.local`. The required variables are documented in `.env.example`.

## Notes

- Demo logins are available on the login screen for employee and admin roles.
- The mock API persists data in localStorage.
