# Project Management System.

A comprehensive project management application built with modern web technologies, featuring role-based access control, milestone tracking, and task management capabilities.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend                                                 │
│  ├── Components (shadcn/ui)                                     │
│  ├── Styling (Tailwind CSS)                                     │
│  ├── State Management (React Context/Redux)                     │
│  └── Firebase Auth SDK                                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express Backend                                      │
│  ├── Authentication Middleware (Firebase Admin SDK)            │
│  ├── Controllers (Route Handlers)                              │
│  ├── Services (Business Logic)                                 │
│  ├── Validators (Input Validation)                             │
│  └── Utilities (Logging, Responses)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Database Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                            │
│  ├── Prisma ORM                                               │
│  ├── Database Schema                                           │
│  ├── Migrations                                               │
│  └── Connection Pooling                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ External Services
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  Firebase Authentication                                         │
│  ├── User Authentication                                        │
│  ├── JWT Token Management                                       │
│  └── Session Management                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18+** - UI library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - Re-usable component library built on Radix UI
- **Firebase Auth SDK** - Client-side authentication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Prisma** - Modern database toolkit and ORM
- **Firebase Admin SDK** - Server-side authentication verification

### Database
- **PostgreSQL** - Relational database management system
- **Prisma Schema** - Database modeling and migration tool

### Authentication
- **Firebase Authentication** - Complete authentication solution
- **JWT Tokens** - Secure token-based authentication

## Project Structure

```
project-management-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Layout components
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── projects/        # Project-related components
│   │   │   ├── tasks/           # Task management components
│   │   │   └── shared/          # Reusable components
│   │   ├── pages/
│   │   │   ├── auth/            # Login, signup pages
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── projects/        # Project management pages
│   │   │   └── tasks/           # Task management pages
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API service functions
│   │   ├── utils/               # Utility functions
│   │   ├── contexts/            # React contexts
│   │   └── types/               # TypeScript type definitions
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Prisma client configuration
│   │   │   ├── firebase.js      # Firebase admin SDK setup
│   │   │   └── env.js           # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.js          # Authentication middleware
│   │   │   ├── validation.js    # Request validation
│   │   │   ├── errorHandler.js  # Error handling
│   │   │   └── cors.js          # CORS configuration
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── projectController.js
│   │   │   ├── milestoneController.js
│   │   │   ├── taskController.js
│   │   │   └── reviewController.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── projectService.js
│   │   │   ├── milestoneService.js
│   │   │   ├── taskService.js
│   │   │   ├── reviewService.js
│   │   │   └── fileService.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── projects.js
│   │   │   ├── milestones.js
│   │   │   ├── tasks.js
│   │   │   └── reviews.js
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── userValidator.js
│   │   │   ├── projectValidator.js
│   │   │   ├── milestoneValidator.js
│   │   │   ├── taskValidator.js
│   │   │   └── reviewValidator.js
│   │   └── utils/
│   │       ├── logger.js
│   │       ├── response.js
│   │       ├── constants.js
│   │       └── helpers.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── server.js
│
├── docs/
│   ├── api/                     # API documentation
│   ├── database/                # Database schema documentation
│   └── deployment/              # Deployment guides
│
├── .env.example
├── docker-compose.yml
└── README.md
```

## Database Schema

### Core Entities

**Users**
- Primary Key: email (String)
- Attributes: skillset (optional)
- Relationships: Creates projects, joins projects, assigned tasks, reviews tasks

**Projects**
- Primary Key: id (cuid)
- Attributes: name, description, status, dates
- Foreign Key: creatorId → User.email
- Relationships: Has members, contains milestones

**ProjectMembers** (Junction Table)
- Primary Key: id (cuid)
- Attributes: role (ADMIN/TASK_COMPLETER), joinedAt
- Foreign Keys: userId → User.email, projectId → Project.id
- Unique Constraint: (userId, projectId)

**Milestones**
- Primary Key: id (cuid)
- Attributes: name, description, status, dates
- Foreign Key: projectId → Project.id
- Relationships: Contains tasks

**Tasks**
- Primary Key: id (cuid)
- Attributes: title, description, priority, status, dates
- Foreign Keys: milestoneId → Milestone.id, assigneeId → User.email
- Relationships: Has reviews, has attachments

**TaskReviews**
- Primary Key: id (cuid)
- Attributes: status, comment, dates
- Foreign Keys: taskId → Task.id, reviewerId → User.email

**TaskAttachments**
- Primary Key: id (cuid)
- Attributes: fileName, fileUrl, fileSize, mimeType
- Foreign Key: taskId → Task.id

### Status Enums

- **ProjectStatus**: ACTIVE, COMPLETED, ARCHIVED, ON_HOLD
- **ProjectRole**: ADMIN, TASK_COMPLETER
- **MilestoneStatus**: PLANNED, IN_PROGRESS, COMPLETED, OVERDUE
- **TaskStatus**: UPCOMING, IN_PROGRESS, IN_REVIEW, COMPLETED, OVERDUE
- **TaskPriority**: LOW, MEDIUM, HIGH, URGENT
- **TaskReviewStatus**: PENDING, APPROVED, REJECTED

## Authentication Flow

### User Registration
1. User signs up via Firebase Auth (frontend)
2. Firebase returns JWT token
3. Frontend sends token + user data to backend
4. Backend verifies token with Firebase Admin SDK
5. Backend creates user record in PostgreSQL
6. User email becomes primary key for all relationships

### Request Authentication
1. Frontend includes Firebase JWT in Authorization header
2. Backend middleware verifies token with Firebase Admin SDK
3. Backend extracts user email from verified token
4. Backend attaches user info to request object
5. Controllers use authenticated user data

## Access Control System

### Role-Based Permissions

**Project Creator**
- Full control over their projects
- Can add/remove members
- Can create milestones and tasks
- Can review task submissions
- Can change project status

**Project Admin (Member Role)**
- Can create milestones and tasks
- Can assign tasks to members
- Can review task submissions
- Cannot add/remove members

**Task Completer (Member Role)**
- Can view assigned tasks
- Can update task status
- Can upload attachments
- Can submit tasks for review

### Permission Middleware
- `authenticateToken`: Verifies Firebase JWT
- `checkProjectAccess`: Validates user project membership
- `checkRole`: Ensures user has required role for action

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Milestones
- `GET /api/projects/:projectId/milestones` - List milestones
- `POST /api/projects/:projectId/milestones` - Create milestone
- `PUT /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone

### Tasks
- `GET /api/milestones/:milestoneId/tasks` - List tasks
- `POST /api/milestones/:milestoneId/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/attachments` - Upload attachment

### Reviews
- `GET /api/tasks/:taskId/reviews` - List task reviews
- `POST /api/tasks/:taskId/reviews` - Create review
- `PUT /api/reviews/:id` - Update review

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Firebase project with Authentication enabled
- npm or yarn package manager

### Backend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd project-management-system/backend
```

2. Install dependencies
```bash
npm install
```

3. Environment configuration
```bash
cp .env.example .env
# Configure environment variables in .env file
```

4. Database setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed database
npx prisma db seed
```

5. Start development server
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd ../frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
# Add Firebase configuration
```

4. Start development server
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## Development Guidelines

### Code Organization
- Follow modular architecture principles
- Separate concerns across layers (controllers, services, validators)
- Use consistent naming conventions
- Implement proper error handling

### Database Best Practices
- Use Prisma migrations for schema changes
- Implement proper foreign key relationships
- Use appropriate data types and constraints
- Regular database backups

### Security Considerations
- Always validate user input
- Use parameterized queries (Prisma handles this)
- Implement rate limiting
- Secure file upload handling
- Proper CORS configuration

### Testing Strategy
- Unit tests for services and utilities
- Integration tests for API endpoints
- Component tests for React components
- End-to-end testing for critical workflows

## Deployment

### Production Checklist
- Environment variables properly configured
- Database migrations applied
- Security headers configured
- Rate limiting enabled
- Logging configured
- Error monitoring setup
- SSL/TLS certificates installed

### Recommended Platforms
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, DigitalOcean
- **Database**: PostgreSQL on Railway, Supabase, AWS RDS
- **File Storage**: Firebase Storage, AWS S3

## Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run linting and testing
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Standards
- Use ESLint and Prettier for code formatting
- Follow conventional commit messages
- Write meaningful test cases
- Document complex business logic
- Update README for significant changes

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Check existing documentation
- Review API documentation in `/docs` directory
