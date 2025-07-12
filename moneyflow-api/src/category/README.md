# Category Module

This module provides CRUD operations for managing global categories in the MoneyFlow application.

## Overview

The Category module manages the master list of categories that can be used across the application. These are global categories that users can assign to their personal category lists via the UserCategory module.

## API Endpoints

### Base URL: `/categories`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new category |
| GET | `/` | Get all categories (with optional filters) |
| GET | `/type/:type` | Get categories by type (INCOME/EXPENSE) |
| GET | `/:id` | Get a specific category by ID |
| GET | `/:id/stats` | Get usage statistics for a category |
| PATCH | `/:id` | Update a category |
| DELETE | `/:id` | Delete a category |

## Features

### ✅ **CRUD Operations**
- Create, read, update, and delete categories
- Type-safe validation using DTOs
- Comprehensive error handling

### ✅ **Filtering & Querying**
- Filter by category type (INCOME/EXPENSE)
- Filter by default categories
- Get categories by specific type

### ✅ **Data Integrity**
- Prevents duplicate categories (same name + type)
- Case-insensitive duplicate checking
- Prevents deletion of categories in use

### ✅ **Usage Analytics**
- Track how many users are using each category
- Count associated expenses and income entries
- Helpful for admin dashboard and cleanup

### ✅ **Best Practices**
- Input validation with class-validator
- Swagger/OpenAPI documentation
- Proper HTTP status codes
- Comprehensive error messages
- Transaction safety

## Example Usage

### Create a Category
```bash
POST /categories
{
  "name": "Food & Dining",
  "type": "EXPENSE",
  "color": "#3b82f6",
  "icon": "🍽️",
  "is_default": true
}
```

### Get All Categories
```bash
GET /categories
GET /categories?type=EXPENSE
GET /categories?is_default=true
```

### Get Usage Stats
```bash
GET /categories/1/stats
```

Response:
```json
{
  "id": 1,
  "name": "Food & Dining",
  "type": "EXPENSE",
  "userCount": 150,
  "expenseCount": 2843,
  "incomeCount": 0
}
```

## Data Validation

- **Name**: 1-50 characters, trimmed
- **Type**: Must be either "INCOME" or "EXPENSE"
- **Color**: Valid hex color format (#RRGGBB)
- **Icon**: 1-10 characters (emojis supported)
- **is_default**: Boolean (optional, defaults to false)

## Error Handling

- **409 Conflict**: Duplicate category name+type
- **404 Not Found**: Category doesn't exist
- **400 Bad Request**: Validation errors or category in use
- **500 Internal Server Error**: Unexpected server errors

## Integration

This module integrates with:
- **UserCategory Module**: For user-specific category assignments
- **UserExpense/UserIncome Modules**: For tracking category usage
- **Prisma ORM**: For database operations

## Security

- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- Proper error message sanitization
