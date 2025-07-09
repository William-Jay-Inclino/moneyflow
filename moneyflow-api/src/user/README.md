# User Module

This module handles user management with email/password authentication and email verification functionality.

## Features

- User registration with email and password
- Email verification system
- User login with password authentication
- User profile management
- User lookup by email or ID
- User active status management

## API Endpoints

### POST /users/register
Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "is_active": true,
  "email_verified": false,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

### POST /users/login
Login user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "is_active": true,
  "email_verified": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

### POST /users/verify-email
Verify user email with token.

**Request Body:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "token": "verification-token-here"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "is_active": true,
  "email_verified": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

### POST /users/resend-verification
Resend email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent successfully"
}
```

### GET /users/profile/:id
Get user profile information by user ID.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "is_active": true,
  "email_verified": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

### GET /users/email/:email
Find user by email address.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "is_active": true,
  "email_verified": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

## Error Handling

The module includes comprehensive error handling for:
- Duplicate email addresses during registration
- Invalid credentials during login
- Unverified email addresses
- Invalid verification tokens
- Invalid input data
- Database connection issues

## Dependencies

- `@nestjs/common`: NestJS core functionality
- `@nestjs/swagger`: API documentation
- `class-validator`: Input validation
- `class-transformer`: Data transformation
- `@prisma/client`: Database ORM
- `bcrypt`: Password hashing

## Integration

To use this module in your application:

1. Import the UserModule in your app.module.ts
2. Ensure PrismaModule is available
3. Configure email service for verification emails
4. Use the provided endpoints for user registration and management

## Next Steps

For complete authentication integration, you may want to add:
- JWT token generation and validation
- Authentication guards
- Password reset functionality
- Email service integration
- Rate limiting for authentication endpoints
- Session management
