# Professional Card Generator - AI Coding Assistant Instructions

## Project Overview

This is a React/Vite application that generates professional business cards with QR codes and resume embedding. The app follows a 3-stage wizard flow: Details → CardStyles → Home (final card display).

## Architecture & Data Flow

### Component Flow Pattern

```
Details.jsx (form) → CardStyles.jsx (design selection) → Home.jsx (card display)
```

- **State Management**: Primary state lives in `Details.jsx` and flows down via props
- **Navigation**: Components use `showCardStyles`/`showHome` boolean flags instead of React Router
- **Card Generation**: Once generated, users cannot return to modify details (`cardGenerated` flag)

### Service Layer Pattern

All backend communication goes through service modules in `src/services/`:

- `cardService.js` - Card CRUD operations, style management
- `userService.js` - User creation/retrieval by email
- `spaceService.js` - Space hierarchy and content management
- `database.js` - MySQL connection pool with promise-based queries

### Database Integration

- **MySQL with JSON columns**: Card data stored as JSON in `cards.card_data`
- **Foreign key cascade**: Deleting users removes associated cards/barcodes
- **Card IDs**: Format `CARD_{timestamp}_{random}` for uniqueness
- **View pattern**: `card_details` view joins all related tables

## Key Development Patterns

### User Data Handling

```javascript
// Always check for existing user by email before creating
let user = await userService.getUserByEmail(userData.email);
if (!user) {
  user = await userService.createUser(userData);
}
```

### State Persistence

- Generated cards save to `localStorage` as backup
- Primary storage is MySQL database
- Card generation is one-way (no edit after generate)

### Component Props Pattern

Each wizard step receives:

```javascript
{
  onBack, onGenerate, userData;
}
```

### Error Handling Convention

- Services throw errors, components catch and console.error
- Database errors logged with context
- UI shows alerts for user-facing errors

## Development Workflow

### Database Setup

1. Run `database/schema.sql` to create tables and default card styles
2. Configure MySQL connection in `.env` or use defaults (localhost/root)

### Development Commands

- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Production build
- `npm run preview` - Preview production build

### Key Dependencies

- **Frontend**: React 19, Vite, TailwindCSS, React Router DOM
- **Backend Integration**: axios, mysql2 (promise-based)
- **Card Features**: html2canvas, jspdf, qrcode
- **Icons**: react-icons

## File Structure Logic

- `components/` - Organized by feature (details, home, CardStyles)
- `services/` - Database operations (one service per table group)
- `config/` - Database connection configuration
- `database/` - SQL schema and migrations

## Important Constraints

- Card generation is **one-way only** - enforce with `cardGenerated` state
- User identification primarily by email
- Card styles are predefined in database (modern, minimal, gradient)
- QR codes embed resume data, not just contact info

## Common Debugging Areas

- Database connection issues: Check `src/config/database.js` environment variables
- Component state flow: Trace `userData` object through the wizard steps
- Card generation: Verify user exists before creating card
- MySQL JSON queries: Card data stored as JSON, parse when retrieved
