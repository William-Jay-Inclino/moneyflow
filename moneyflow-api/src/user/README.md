# User Module

This module handles user management with Google OAuth registration functionality.

## Features

- User registration via Google OAuth
- User profile management
- User lookup by email or ID
- User active status management

## API Endpoints

### POST /users/register/google
Register a new user using Google OAuth credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "googleId": "1234567890",
  "fullName": "John Doe",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "email": "user@example.com",
  "is_active": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

### GET /users/profile/:id
Get user profile information by user ID.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "email": "user@example.com",
  "is_active": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

### GET /users/email/:email
Find user by email address.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "email": "user@example.com",
  "is_active": true,
  "registered_at": "2023-01-01T00:00:00.000Z"
}
```

## Error Handling

The module includes comprehensive error handling for:
- Duplicate email addresses
- Username conflicts
- Invalid input data
- Database connection issues

## Dependencies

- `@nestjs/common`: NestJS core functionality
- `@nestjs/swagger`: API documentation
- `class-validator`: Input validation
- `class-transformer`: Data transformation
- `@prisma/client`: Database ORM

## Integration

To use this module in your application:

1. Import the UserModule in your app.module.ts
2. Ensure PrismaModule is available
3. Configure Google OAuth in your application
4. Use the provided endpoints for user registration and management

## Next Steps

For complete Google OAuth integration, you may want to add:
- Google OAuth strategy with Passport
- JWT token generation
- Authentication guards
- User session management
- OAuth callback handling
