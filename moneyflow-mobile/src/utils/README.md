# Utility Functions Documentation

This folder contains reusable utility functions for the MoneyFlow mobile app.

## Cost Utils (`costUtils.ts`)

### `parseCostToNumber(cost: any): number`
Safely converts cost values to numbers, handling various input types including:
- Prisma Decimal objects
- String values  
- Number values
- Null/undefined values

**Usage:**
```typescript
import { parseCostToNumber } from '../../utils/costUtils';

const amount = parseCostToNumber(expense.cost); // Works with any format
```

### `formatCostInput(value: string): string`
Formats user input for cost fields by:
- Removing non-numeric characters except decimal points
- Ensuring only one decimal point exists

**Usage:**
```typescript
import { formatCostInput } from '../../utils/costUtils';

const handleCostChange = (value: string) => {
    setCost(formatCostInput(value));
};
```

### `isValidCost(cost: string): boolean`
Validates if a cost string represents a valid positive number.

## Configuration Utils (`config.ts`)

**Environment-safe configuration loading with automatic fallbacks to prevent runtime errors.**

### `getConfig(): object`
Returns the full configuration object with all environment variables and defaults.

### `getTimezone(): string`
Returns the timezone configured in the `.env` file (defaults to 'Asia/Manila').

**Features:**
- Safely loads from `.env` file via `@env` module when available
- No runtime errors or warnings if babel plugin isn't configured
- Automatic fallback to hardcoded defaults
- Prevents "Requiring unknown module" warnings

**Usage:**
```typescript
import { getConfig, getTimezone } from '../../utils/config';

const config = getConfig();
const timezone = getTimezone(); // "Asia/Manila" or from TZ env variable
```

**Default Values:**
- `TZ`: 'Asia/Manila'
- `API_URL`: 'https://jaytechsolutions.cloud/moneyflow/api'
- `APP_VERSION`: '1.0.0'
- And other configured defaults...

## Date Utils (`dateUtils.ts`)

**Timezone-aware date formatting using `date-fns` and `date-fns-tz` libraries. All functions automatically use the timezone from configuration.**

### `formatDate(dateString: string): string`
Formats a date string to "Jan 15, 2024" format using the configured timezone.

### `formatTime(dateString: string): string`
Formats a date to a time string in 12-hour format using the configured timezone.

### `formatDateTime(dateString: string): string`
Formats a date to a full date and time string (e.g., "Jan 15, 2024 2:30 PM") with timezone.

### `formatShortDate(dateString: string): string`
Formats a date to short format (e.g., "01/15/24") with timezone.

### `formatFullDate(dateString: string): string`
Formats a date to a full date string (e.g., "Monday, January 15, 2024") with timezone.

### `formatTimeOnly(dateString: string): string`
Formats a date to 24-hour time format (e.g., "14:30") with timezone.

### `formatISODate(date: Date): string`
Formats a date to ISO date string (YYYY-MM-DD) in the configured timezone.

### `getCurrentDate(): Date`
Gets the current date.

### `getCurrentISODate(): string`
Gets the current date formatted as ISO string in the configured timezone.

**Usage:**
```typescript
import { 
    formatDate, 
    formatTime, 
    formatDateTime,
    formatShortDate,
    formatFullDate,
    formatTimeOnly,
    formatISODate 
} from '../../utils/dateUtils';

const displayDate = formatDate(expense.created_at);          // "Jan 15, 2024"
const displayTime = formatTime(expense.created_at);          // "2:30 PM"
const dateTime = formatDateTime(expense.created_at);         // "Jan 15, 2024 2:30 PM"
const shortDate = formatShortDate(expense.created_at);       // "01/15/24"
const fullDate = formatFullDate(expense.created_at);         // "Monday, January 15, 2024"
const timeOnly = formatTimeOnly(expense.created_at);         // "14:30"
const isoDate = formatISODate(new Date());                   // "2025-01-15"
const today = getCurrentISODate();                           // Current date in timezone
```

## Form Validation (`formValidation.ts`)

### `validateExpenseForm(cost, notes, categoryId, userId?): string | null`
Validates expense form data and returns an error message or null if valid.

### `validateIncomeForm(amount, notes, categoryId, userId?): string | null`
Validates income form data and returns an error message or null if valid.

### `validateRequiredField(value, fieldName): string | null`
Generic validation for required text fields.

**Usage:**
```typescript
import { validateExpenseForm } from '../../utils/formValidation';

const handleSubmit = () => {
    const error = validateExpenseForm(cost, notes, categoryId, user?.id);
    if (error) {
        Alert.alert('Validation Error', error);
        return;
    }
    // Proceed with submission
};
```

## Import All Utils

You can import all utilities from the main utils index:

```typescript
import { 
    parseCostToNumber, 
    formatCostInput, 
    formatDate, 
    validateExpenseForm 
} from '../../utils';
```

## Benefits

- **Consistency**: Same logic across all screens
- **Maintainability**: Single source of truth for common operations
- **Testability**: Utilities can be unit tested independently
- **Reusability**: Can be used in any component that needs these functions
- **Type Safety**: Full TypeScript support with proper type definitions
