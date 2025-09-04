#  Social Care 365

A comprehensive social care management system designed to streamline case management, task tracking, and client care coordination for social care professionals.

## Live:
- **Frontend**: [https://socialcare-frontend.onrender.com](https://socialcare-frontend.onrender.com)
- **Backend API**: [https://socialcare-backend.onrender.com](https://socialcare-backend.onrender.com)

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login system
- Role-based access control (Caregiver/Manager)
- JWT token authentication
- Secure password hashing

### 📋 Case Management
- Create and manage client cases
- Case status tracking (Open, In Progress, Completed, Archived)
- Client information management
- Case assignment and ownership

### ✅ Task Management
- Kanban board interface for task visualisation
- Task creation, editing, and status updates
- Priority levels and due dates
- Case-linked task management
- Drag-and-drop status updates

### 📅 Meeting & Calendar Integration
- Schedule meetings with clients
- Calendar view integration
- Meeting type categorisation
- Attendee management

### 💬 Communication System
- Task-specific comments
- Case-specific comments
- User attribution and timestamps
- Threaded discussions

### 📊 Dashboard & Reporting
- Overview of active cases and tasks
- User-specific task views
- Manager vs. Caregiver permissions
- Real-time status updates

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router DOM** - Client-side routing
- **FullCalendar** - Calendar component
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling and responsive design

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Testing
- **Jest** - Testing framework
- **React Testing Library** - Frontend testing
- **Supertest** - Backend API testing
- **MongoDB Memory Server** - Test database

## Loading the Application

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/socialcare99.git
   cd socialcare99
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   **Backend (.env):**
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   
   **Frontend (.env):**
   ```env
   REACT_APP_API_URL=http://localhost:3000
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend application**
   ```bash
   cd client
   npm start
   ```

## Testing

### Backend Tests
```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

### Frontend Tests
```bash
cd client
npm test                   # Run all tests
npm test -- --coverage     # Generate coverage report
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Cases
- `POST /api/cases` - Create new case
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get specific case
- `PUT /api/cases/:id` - Update case
- `PUT /api/cases/:id/archive` - Archive/unarchive case

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get all tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Meetings
- `POST /api/meetings` - Schedule meeting
- `GET /api/meetings` - Get all meetings
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Cancel meeting

### Comments
- `POST /api/tasks/:id/comments` - Add task comment
- `GET /api/tasks/:id/comments` - Get task comments
- `POST /api/cases/:id/comments` - Add case comment
- `GET /api/cases/:id/comments` - Get case comments