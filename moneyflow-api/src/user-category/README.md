# User Category Module

This module handles unified user category management for both expenses and income, allowing users to create, read, update, and delete their categories.

## Features

- Create new categories with type (EXPENSE or INCOME)
- Retrieve all categories or filter by type
- Get individual category by ID
- Update existing categories
- Delete categories (with validation to prevent deletion of categories in use)
- User isolation - users can only manage their own categories

## API Endpoints

All endpoints are prefixed with `/users/:user_id/categories`

### Create Category
- **POST** `/users/:user_id/categories`
- Creates a new category for the specified user
- Body: `{ "name": "Food & Dining", "type": "EXPENSE" }`

### Get Categories
- **GET** `/users/:user_id/categories`
- Retrieves all categories for the specified user
- Optional query: `?type=EXPENSE` or `?type=INCOME` to filter by type

### Get Category by ID
- **GET** `/users/:user_id/categories/:category_id`
- Retrieves a specific category by its ID

### Update Category
- **PATCH** `/users/:user_id/categories/:category_id`
- Updates an existing category
- Body: `{ "name": "Updated Name", "type": "INCOME" }`

### Delete Category
- **DELETE** `/users/:user_id/categories/:category_id`
- Deletes a category
- Validation: Prevents deletion if category is used by any expenses or income entries

## DTOs

- `CreateUserCategoryDto`: Data for creating new categories (name, type)
- `UpdateUserCategoryDto`: Data for updating existing categories (partial)
- `FilterUserCategoryDto`: Query parameters for filtering categories by type

## Entity

- `UserCategoryEntity`: Represents a user category with id, user_id, name, and type

## Validation

- Category names must be unique per user per type (user can have "Food" for both EXPENSE and INCOME)
- Categories in use cannot be deleted
- All operations are scoped to the authenticated user

## Types

- `CategoryType`: Enum with values `EXPENSE` and `INCOME`
