# User Expense API

This module provides a comprehensive REST API for managing user expenses with full CRUD operations, filtering, pagination, and summary statistics.

## Features

- ✅ Full CRUD operations for user expenses
- ✅ User-scoped operations (expenses are isolated by user)
- ✅ Advanced filtering and pagination
- ✅ Expense summary and analytics
- ✅ Swagger documentation
- ✅ Input validation
- ✅ Snake case naming convention
- ✅ Error handling

## API Endpoints

### Base URL: `/moneyflow/api/users/{user_id}/expenses`

### 1. Create User Expense
- **POST** `/moneyflow/api/users/{user_id}/expenses`
- **Body:**
  ```json
  {
    "category_id": 1,
    "cost": "25.50",
    "notes": "Lunch at restaurant"
  }
  ```

### 2. Get User Expenses (by year and month)
- **GET** `/moneyflow/api/users/{user_id}/expenses`
- **Query Parameters:**
  - `year` (required): Year for filtering (e.g., 2025)
  - `month` (required): Month for filtering (1-12)
- **Response:** Array of user expenses for the specified month and year

### 3. Get User Expense Summary
- **GET** `/moneyflow/api/users/{user_id}/expenses/summary`
- **Query Parameters:**
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
- **Response:**
  ```json
  {
    "total_expenses": 150,
    "total_cost": "1250.75",
    "categories_summary": [
      {
        "category_id": 1,
        "category_name": "Food",
        "total_cost": "850.25",
        "count": 45
      }
    ]
  }
  ```

### 4. Get Single User Expense
- **GET** `/moneyflow/api/users/{user_id}/expenses/{expense_id}`

### 5. Update User Expense
- **PATCH** `/moneyflow/api/users/{user_id}/expenses/{expense_id}`
- **Body:** (all fields optional)
  ```json
  {
    "category_id": 2,
    "cost": "30.00",
    "notes": "Updated notes"
  }
  ```

### 6. Delete User Expense
- **DELETE** `/moneyflow/api/users/{user_id}/expenses/{expense_id}`

## Data Models

### UserExpense Entity
```typescript
{
  id: string;              // UUID
  user_id: string;         // UUID
  created_at: Date;        // Timestamp
  category_id: number;     // Integer
  cost: Decimal;           // Decimal(10,2)
  notes?: string;          // Optional string
  category?: {             // Optional relation
    id: number;
    name: string;
  };
}
```

### DTOs

#### FindUserExpenseDto
```typescript
{
    year: number;           // Required, year (1900-2100)
    month: number;          // Required, month (1-12)
}
```

#### CreateUserExpenseDto
```typescript
{
  category_id: number;     // Required, positive integer
  cost: string;           // Required, decimal string
  notes?: string;         // Optional
}
```

#### UpdateUserExpenseDto
```typescript
{
  category_id?: number;    // Optional, positive integer
  cost?: string;          // Optional, decimal string
  notes?: string;         // Optional
}
```

## Business Logic

### User Isolation
- All operations are scoped to a specific user
- Users can only access their own expenses
- Category validation ensures categories belong to the user

### Validation
- Input validation using `class-validator`
- UUID validation for user_id and expense_id
- Decimal validation for cost fields
- Year and month validation for date filtering

### Error Handling
- Proper HTTP status codes
- Descriptive error messages
- Validation error details
- Not found errors for non-existent resources

## Database Relations

The module leverages Prisma relations:
- `UserExpense` belongs to `User` (user_id)
- `UserExpense` belongs to `UserExpenseCategory` (category_id)
- Proper foreign key constraints with cascade deletes

## Swagger Documentation

Full API documentation is available at `/moneyflow/api/docs` when the server is running.

## Testing

Run tests with:
```bash
npm test -- --testPathPattern=user-expense
```

## Usage Examples

### Create an expense
```bash
curl -X POST http://localhost:7000/moneyflow/api/users/123e4567-e89b-12d3-a456-426614174000/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "cost": "25.50",
    "notes": "Lunch at restaurant"
  }'
```

### Get expenses by year and month
```bash
curl "http://localhost:7000/moneyflow/api/users/123e4567-e89b-12d3-a456-426614174000/expenses?year=2025&month=7"
```

### Get expense summary
```bash
curl "http://localhost:7000/moneyflow/api/users/123e4567-e89b-12d3-a456-426614174000/expenses/summary?start_date=2025-07-01T00:00:00Z&end_date=2025-07-31T23:59:59Z"
```
