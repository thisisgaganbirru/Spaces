# Professional Card Generator

A full-stack web application built with React and Vite that generates professional business cards with embedded QR codes, resume data, and portfolio links. The application provides a modern, intuitive wizard-based interface for creating and managing customized business cards.

## Project Overview

**Professional Card Generator** is a comprehensive card creation platform featuring:

- **3-Stage Wizard Flow**: Details collection → Design selection → Final card preview
- **Embedded QR Codes**: Dynamically generated QR codes containing contact and resume information
- **Multiple Card Styles**: Pre-designed modern, minimal, and gradient card templates
- **PDF Export**: Download professional business cards as PDF documents
- **Portfolio Management**: Organize cards within spaces and manage content hierarchies
- **User Authentication**: Email-based user identification and management
- **Resume Integration**: Upload or link resumes directly to business cards

## Technology Stack

### Frontend

- **React 19** - UI component framework
- **Vite 7** - Lightning-fast build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM 7** - Client-side routing
- **html2canvas** - Convert HTML to canvas for PDF generation
- **jsPDF** - PDF document generation
- **QRCode** - QR code generation library
- **Lucide React & React Icons** - Icon libraries

### Backend

- **Node.js / Express** - REST API server
- **MySQL 8** - Relational database with JSON support
- **Helmet** - Security headers middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling and DDoS protection

### Development Tools

- **ESLint** - Code quality and linting
- **PostCSS** - CSS transformation
- **Autoprefixer** - Browser compatibility
- **Concurrently** - Run multiple npm scripts simultaneously

## Project Structure

```
Spaces/
├── src/                              # Frontend source code
│   ├── components/                   # React components
│   │   ├── details/Details.jsx       # User details collection form
│   │   ├── CardStyles.jsx            # Card design selection
│   │   ├── home/Home.jsx             # Final card display
│   │   ├── Navbar.jsx                # Navigation component
│   │   ├── Portfolio.jsx             # Portfolio view
│   │   ├── Spaces.jsx                # Space management
│   │   ├── SpaceView.jsx             # Individual space view
│   │   ├── SpaceContent.jsx          # Space content display
│   │   ├── SpaceChild.jsx            # Child space component
│   │   └── Account.jsx               # User account management
│   ├── services/                     # API service layer
│   │   ├── cardService.js            # Card CRUD operations
│   │   ├── userService.js            # User management
│   │   └── spaceService.js           # Space hierarchy management
│   ├── config/
│   │   └── api.js                    # API configuration
│   ├── App.jsx                       # Root component with routing
│   ├── main.jsx                      # Application entry point
│   └── App.css / index.css           # Global styles
│
├── backend/                          # Backend server code
│   ├── server.js                     # Express server setup
│   ├── config/
│   │   └── database.js               # MySQL connection pool
│   ├── routes/
│   │   ├── cards.js                  # Card endpoints
│   │   ├── users.js                  # User endpoints
│   │   └── spaces.js                 # Space endpoints
│   └── package.json
│
├── database/                         # Database schemas and migrations
│   ├── schema.sql                    # Initial database schema
│   ├── fix_schema.sql                # Schema corrections
│   └── add_content_status.sql        # Content status additions
│
├── vite.config.js                    # Vite configuration
├── package.json                      # Frontend dependencies & scripts
└── README.md                         # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+
- Modern web browser

### Installation

1. **Clone and setup the project**:

   ```bash
   npm run setup
   ```

   This installs both frontend and backend dependencies.

2. **Configure the database**:

   ```bash
   npm run db-setup
   ```

   This creates the MySQL database schema and initializes default card styles.

3. **Environment Setup**:
   Create a `.env` file in the root and `backend/.env` with:
   ```
   # Backend
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=card_generator
   ```

### Development

**Start both frontend and backend servers**:

```bash
npm run dev
```

This uses `concurrently` to run:

- Frontend: `http://localhost:5173` (Vite dev server with HMR)
- Backend: `http://localhost:3001` (Express API server)

**Individual server commands**:

```bash
npm run frontend    # Start Vite dev server only
npm run backend     # Start Express server only
```

### Building for Production

```bash
npm run build
```

Generates optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Launches the production build locally for testing.

## Core Features

### 1. Business Card Generation Wizard

The wizard guides users through a 3-step process:

#### Step 1: Details Collection

- Personal information (first name, last name, title)
- Contact details (email, phone, location)
- Social profiles (LinkedIn, GitHub, portfolio)
- Resume upload or URL

#### Step 2: Card Design Selection

- Choose from predefined card styles (Modern, Minimal, Gradient)
- Preview in real-time
- Customizable design templates

#### Step 3: Final Card Preview

- View generated business card
- Embedded QR code linking to resume and contact info
- Export to PDF with high quality
- Download ready-to-print business cards

### 2. Card Management

- Save multiple card designs
- Card style templates stored in database
- One-way generation (edit not allowed after generation for data integrity)
- Card data stored as JSON for flexibility

### 3. Space & Portfolio Management

- Organize cards within nested space hierarchies
- Parent-child space relationships
- Content management within spaces
- Portfolio view for showcasing cards

### 4. User Management

- Email-based user identification
- Automatic user creation on card generation
- User profile management
- Associated card storage

## API Endpoints

### Cards

- `GET /api/cards/styles` - Get all available card styles
- `GET /api/cards/styles/:name` - Get specific card style
- `POST /api/cards` - Create new card
- `GET /api/cards/:cardId` - Get card details
- `PUT /api/cards/:cardId` - Update card
- `DELETE /api/cards/:cardId` - Delete card

### Users

- `POST /api/users` - Create user
- `GET /api/users/email/:email` - Get user by email
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user profile

### Spaces

- `GET /api/spaces` - List all spaces
- `GET /api/spaces/:spaceId` - Get space details
- `POST /api/spaces` - Create new space
- `PUT /api/spaces/:spaceId` - Update space
- `DELETE /api/spaces/:spaceId` - Delete space

## Data Flow Architecture

```
User Form Input (Details Component)
         ↓
    Validation & Processing
         ↓
  User Creation / Retrieval (userService)
         ↓
  Card Generation & Styling
         ↓
  QR Code Embedding
         ↓
  Database Storage (MySQL)
         ↓
  Display in Home Component
         ↓
    PDF Export / Download
```

### State Management

- **Primary state** resides in the Details component
- **Props-based communication** between wizard steps
- **LocalStorage backup** for generated card data
- **Immutable generation** - Cards cannot be edited post-generation

### Database Integration

- **MySQL with JSON support** for flexible card data storage
- **Foreign key cascades** ensure data consistency
- **Unique card IDs** using format: `CARD_{timestamp}_{random}`
- **View pattern** (`card_details`) joins all related tables

## Key Development Patterns

### Service Layer Pattern

All backend communication goes through dedicated service modules:

```javascript
// Example: Creating a user
let user = await userService.getUserByEmail(userData.email);
if (!user) {
  user = await userService.createUser(userData);
}
```

### Component Props Pattern

Wizard steps receive consistent props:

```javascript
{
  onBack, // Navigation callback
    onGenerate, // Card generation callback
    userData; // User data object
}
```

### Error Handling

- Services throw detailed errors
- Components catch and log with context
- User-facing alerts for validation errors
- Database errors logged with full context

## Database Schema

### Key Tables

- **users** - User profiles and contact information
- **cards** - Business card designs and content (JSON)
- **card_styles** - Predefined card style templates
- **spaces** - Space hierarchy (parent-child relationships)
- **space_content** - Content within spaces
- **barcodes** - QR code data and embeddings

### Relations

- Users → Cards (one-to-many)
- Users → Spaces (one-to-many)
- Spaces → Spaces (hierarchical, self-referencing)
- Cards → Styles (many-to-one)

## Scripts Reference

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start both frontend and backend with HMR |
| `npm run build`     | Production build                         |
| `npm run preview`   | Preview production build                 |
| `npm run lint`      | Run ESLint code quality checks           |
| `npm run setup`     | Install all dependencies                 |
| `npm run setup-db`  | Initialize database schema               |
| `npm run init-data` | Load initial data and card styles        |
| `npm run db-setup`  | Complete database setup                  |
| `npm run test-db`   | Test database connectivity               |
| `npm run backend`   | Start Express server only                |
| `npm run frontend`  | Start Vite dev server only               |
| `npm run start`     | Start both servers (alias)               |

## Common Development Tasks

### Testing Database Connection

```bash
npm run test-db
```

### Resetting Database

```bash
npm run setup-db
npm run init-data
```

### Development with Code Quality Checks

```bash
npm run dev  # Terminal 1
npm run lint # Terminal 2 (check code quality)
```

## Troubleshooting

### Database Connection Issues

- Check `.env` file has correct MySQL credentials
- Ensure MySQL service is running
- Verify database exists: `card_generator`

### Port Already in Use

- Frontend: Change Vite port in `vite.config.js`
- Backend: Set `PORT` in `.env`

### Module Not Found Errors

- Run `npm run setup` to install all dependencies
- Clear `node_modules` and reinstall if issues persist

### Card Generation Fails

- Verify user email is valid
- Check database schema is up-to-date
- Review browser console for API errors

## Security Features

- **Helmet.js** - HTTP headers security
- **CORS** - Cross-origin request validation
- **Rate Limiting** - DDoS protection (100 requests/15 min per IP)
- **Input Validation** - Email and form field validation
- **SQL Injection Protection** - Parameterized queries via mysql2

## Performance Optimization

- **Vite's Hot Module Replacement** for instant dev feedback
- **Code splitting** via React Router
- **Lazy loading** of components
- **Database connection pooling** for efficiency
- **PDF generation** handled client-side to reduce server load

## Contributing Guidelines

1. Follow the existing component structure
2. Use service layer for all API calls
3. Maintain consistent state management patterns
4. Add error handling for all async operations
5. Test database changes with `npm run test-db`
6. Run linter before committing: `npm run lint`

## License

This project is private and proprietary. All rights reserved.

## Support & Documentation

For detailed setup instructions and troubleshooting, see:

- [DATABASE_INTEGRATION.md](DATABASE_INTEGRATION.md)
- [PROJECT_CLEANUP.md](PROJECT_CLEANUP.md)

For architecture and pattern guidelines, refer to `.github/copilot-instructions.md`
