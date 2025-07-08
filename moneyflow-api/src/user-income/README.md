# User Income Module

This module handles user income management operations including creating, reading, updating, and deleting income entries.

## Features

- Create new income entries
- Retrieve income entries by year and month
- Get individual income entry by ID
- Update existing income entries
- Delete income entries
- Get income summary with totals and category breakdown

## API Endpoints

All endpoints are prefixed with `/users/:user_id/income`

### Create Income Entry
- **POST** `/users/:user_id/income`
- Creates a new income entry for the specified user

### Get Income Entries
- **GET** `/users/:user_id/income?year=YYYY&month=MM`
- Retrieves all income entries for the specified user, year, and month

### Get Income Summary
- **GET** `/users/:user_id/income/summary?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- Retrieves income summary with totals and category breakdown for the specified date range

### Get Income Entry by ID
- **GET** `/users/:user_id/income/:income_id`
- Retrieves a specific income entry by its ID

### Update Income Entry
- **PATCH** `/users/:user_id/income/:income_id`
- Updates an existing income entry

### Delete Income Entry
- **DELETE** `/users/:user_id/income/:income_id`
- Deletes an income entry

## DTOs

- `CreateUserIncomeDto`: Data for creating new income entries
- `UpdateUserIncomeDto`: Data for updating existing income entries
- `FindUserIncomeDto`: Query parameters for filtering income entries by year and month

## Entity

- `UserIncomeEntity`: Represents a user income entry with category information
