# Express Template

A modern Node.js Express API template with authentication, user management, and PostgreSQL database integration using Prisma ORM.

## Features

- ✅ **Express v5** - Latest Express framework
- ✅ **ES6 Modules** - Modern JavaScript module system
- ✅ **PostgreSQL + Prisma** - Database with ORM
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-based Authorization** - USER and ADMIN roles
- ✅ **Input Validation** - Express-validator integration
- ✅ **Error Handling** - Centralized error management
- ✅ **Response Utilities** - Consistent API responses
- ✅ **Security** - CORS, bcrypt password hashing
- ✅ **Logging** - Morgan HTTP request logger
- ✅ **Environment Configuration** - dotenv support
- ✅ **API Testing** - Built-in test scripts

## Project Structure

```
express-template/
├── app.js                 # Main application entry point
├── controllers/           # Route controllers
│   ├── authController.js  # Authentication endpoints
│   └── userController.js  # User management endpoints
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication & authorization
│   └── errorHandler.js   # Global error handling
├── routes/               # API routes
│   ├── authRoutes.js     # Auth endpoints
│   └── userRoutes.js     # User endpoints
├── services/             # Business logic
│   ├── authService.js    # Auth business logic
│   └── userService.js    # User business logic
├── validators/           # Input validation
│   ├── authValidator.js  # Auth validation rules
│   └── userValidator.js  # User validation rules
├── utils/                # Utility functions
│   ├── constants.js      # App constants
│   └── response.js       # Response utilities
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   ├── seed.js          # Database seeding
│   └── index.js         # Prisma client
└── test-api.js          # API testing script
```

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/artijo/express-template.git
cd express-template

# Install dependencies
npm install
```

### 2. Environment Setup

Copy the environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Environment
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - User logout (protected)

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (admin only)

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {...},
  "timestamp": "2025-06-02T04:40:31.592Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": null,
  "timestamp": "2025-06-02T04:40:39.198Z"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ],
  "timestamp": "2025-06-02T04:40:39.198Z"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get access token and refresh token
2. **Include Bearer token** in Authorization header for protected routes
3. **Refresh token** when access token expires

### Example Usage

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Access protected route
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Schema

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}
```

### Post Model
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
}
```

### Roles
- `USER` - Standard user (default)
- `ADMIN` - Administrator with elevated permissions

## Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start           # Start production server

# Database
npm run db:migrate  # Run Prisma migrations
npm run db:generate # Generate Prisma client
npm run db:studio   # Open Prisma Studio
npm run db:seed     # Seed database with sample data

# Testing & Validation
npm run test        # Run API tests
npm run test:api    # Run API tests
npm run validate    # Validate ES6 syntax
npm run check:env   # Check environment variables
npm run check:db    # Test database connection

# Utilities
npm run inspect     # Start with Node.js inspector
npm run production  # Start in production mode
```

## Testing

The project includes a comprehensive API testing script:

```bash
# Run all API tests
npm run test

# Test specific functionality
npm run test:api
```

The test script will automatically:
- Check server connectivity
- Test all API endpoints
- Validate authentication flows
- Report test results

## Security Features

- **Password Hashing** - bcrypt with configurable rounds
- **JWT Security** - Secure token generation and validation
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Configurable CORS policies
- **Rate Limiting** - Protection against abuse
- **Error Handling** - No sensitive data leakage

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `1h` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |

## Development Guidelines

### Adding New Routes

1. Create controller in `controllers/`
2. Add validation rules in `validators/`
3. Define routes in `routes/`
4. Register routes in `app.js`

### Error Handling

Use the response utilities for consistent error handling:

```javascript
import responseUtils from '../utils/response.js';

// Success
responseUtils.success(res, data, 'Success message');

// Error
responseUtils.internalError(res, 'Error message');

// Validation error
responseUtils.validationError(res, errors);
```

### Database Operations

Use Prisma for all database operations:

```javascript
import prisma from '../prisma/index.js';

// Create
const user = await prisma.user.create({ data: userData });

// Read
const users = await prisma.user.findMany();

// Update
const user = await prisma.user.update({
  where: { id },
  data: updateData
});

// Delete
await prisma.user.delete({ where: { id } });
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- GitHub Issues: [https://github.com/artijo/express-template/issues](https://github.com/artijo/express-template/issues)
- Repository: [https://github.com/artijo/express-template](https://github.com/artijo/express-template)