# Professional Card Generator - Database Integration

## 🏗️ **New Architecture Overview**

This project has been completely refactored to use a proper **backend API** with **MySQL database** integration, removing all localStorage dependencies for better data consistency and scalability.

### **Architecture Stack:**

```
Frontend (React + Vite) ↔ Backend API (Express.js) ↔ MySQL Database
```

## 🚀 **Quick Start**

### **1. Start Backend API Server**

```bash
cd backend
npm install
npm run dev
```

**Backend will run on:** `http://localhost:3001`

### **2. Start Frontend Development Server**

```bash
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

### **3. Database Setup**

Ensure MySQL is running with the `projectpfcard` database and tables from `database/schema.sql`.

## 📁 **New Project Structure**

```
projectpfcard/
├── frontend/                    # React application
│   ├── src/
│   │   ├── services/           # API client services (no localStorage)
│   │   │   ├── spaceService.js # Space operations via API
│   │   │   ├── userService.js  # User operations via API
│   │   │   └── cardService.js  # Card operations via API
│   │   ├── config/
│   │   │   └── api.js          # API configuration
│   │   └── components/         # React components
│   └── package.json
├── backend/                     # Express.js API server
│   ├── server.js               # Main server file
│   ├── config/
│   │   └── database.js         # MySQL connection
│   ├── routes/                 # API endpoints
│   │   ├── spaces.js           # Space CRUD operations
│   │   ├── users.js            # User CRUD operations
│   │   └── cards.js            # Card CRUD operations
│   ├── package.json
│   └── .env                    # Database credentials
└── database/
    └── schema.sql              # Database schema
```

## 🔄 **API Endpoints**

### **Spaces API** (`/api/spaces`)

- `GET /root` - Get all root spaces
- `GET /user/:userId/root` - Get user's root spaces
- `GET /:spaceId` - Get space by ID
- `GET /:spaceId/children` - Get child spaces
- `POST /` - Create new space
- `PUT /:spaceId` - Update space
- `DELETE /:spaceId` - Delete space

### **Users API** (`/api/users`)

- `GET /:userId` - Get user by ID
- `GET /email/:email` - Get user by email
- `POST /` - Create new user
- `PUT /:userId` - Update user

### **Cards API** (`/api/cards`)

- `GET /styles` - Get card styles
- `GET /:cardId` - Get card by ID
- `GET /user/:userId` - Get user's cards
- `POST /` - Create new card
- `PUT /:cardId` - Update card
- `DELETE /:cardId` - Delete card

## ✅ **Changes Made**

### **✅ Removed localStorage Dependencies**

- **Before:** All services had localStorage fallbacks
- **After:** Pure API-based data management
- **Files Updated:**
  - `src/services/spaceService.js` - Now uses HTTP requests
  - `src/services/userService.js` - API-only implementation
  - `src/services/cardService.js` - Database via API
  - `src/components/details/Details.jsx` - Removed localStorage backup

### **✅ Added Backend API Server**

- **Express.js server** with proper routes
- **MySQL database integration** with connection pooling
- **CORS enabled** for frontend communication
- **Error handling** and validation
- **Rate limiting** and security headers

### **✅ Database-First Approach**

- **No temporary storage** - all data persists in MySQL
- **Proper foreign key relationships**
- **Database views** for complex queries
- **Transaction support** for data integrity

### **✅ Frontend Service Layer**

- **Clean API abstractions** in service files
- **Consistent error handling** across all services
- **Promise-based** async operations
- **Console logging** for debugging

## 🔧 **Development Workflow**

### **1. Backend Development**

```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### **2. Frontend Development**

```bash
npm run dev  # Vite dev server with hot reload
```

### **3. API Testing**

Test API endpoints directly:

```bash
# Health check
curl http://localhost:3001/health

# Get root spaces
curl http://localhost:3001/api/spaces/root

# Create new space
curl -X POST http://localhost:3001/api/spaces \
  -H "Content-Type: application/json" \
  -d '{"name":"New Space","userId":1,"color":"#3498db"}'
```

## 🛠️ **Configuration**

### **Database Configuration** (`backend/.env`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mysql@9530
DB_NAME=projectpfcard
PORT=3001
```

### **API Configuration** (`src/config/api.js`)

```javascript
export const API_CONFIG = {
  BASE_URL: "http://localhost:3001/api",
  TIMEOUT: 10000,
};
```

## 🔍 **Debugging**

### **Backend Logs**

- Database connection status
- API request/response logging
- Error details with stack traces

### **Frontend Logs**

- Service method calls
- API response data
- Error handling in browser console

### **Common Issues**

1. **CORS Errors:** Ensure backend CORS allows frontend origin
2. **Database Connection:** Check MySQL server and credentials
3. **Port Conflicts:** Ensure ports 3001 (backend) and 5173 (frontend) are free

## 🎯 **Next Steps**

1. **Authentication:** Add user login/session management
2. **File Upload:** Implement file storage for space content
3. **Real-time Updates:** Add WebSocket support
4. **Deployment:** Configure for production environment
5. **Testing:** Add API endpoint tests

## 📊 **Performance Benefits**

- **No localStorage size limits**
- **Centralized data management**
- **Better concurrent user support**
- **Data consistency across sessions**
- **Scalable architecture**

---

**🎉 LocalStorage has been completely eliminated and replaced with proper database integration via API!**
