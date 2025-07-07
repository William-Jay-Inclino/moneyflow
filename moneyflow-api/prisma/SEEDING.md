# Database Seeding Guide

## Overview
This guide explains how to seed your database with default category data for the MoneyFlow API.

## Prerequisites
- Prisma database connection configured
- Prisma Client generated
- Node.js and npm/yarn installed

## Running the Seeder

### 1. Generate Prisma Client
First, make sure your Prisma Client is generated:
```bash
npx prisma generate
```

### 2. Run the Seeder
Execute the seeder script:
```bash
npm run db:seed
```

## What Gets Seeded

### Expense Categories (13 categories)
- 🍽️ Eating out (#FF6B6B)
- 🚗 Transportation (#4ECDC4)
- 🛒 Groceries & Essentials (#45B7D1)
- ⚡ Utilities (#96CEB4)
- 🏠 Housing (#FFEAA7)
- 📱 Load / Subscriptions (#DDA0DD)
- 🏥 Healthcare (#98D8C8)
- 🛡️ Insurance (#F7DC6F)
- 🛍️ Shopping (#BB8FCE)
- 🎭 Entertainment (#85C1E9)
- 💰 Savings & Investment (#82E0AA)
- 🎁 Gifts & Donations (#F8C471)
- 📝 Others (#D5DBDB)

### Income Categories (6 categories)
- 💼 Salary / Wages (#58D68D)
- 📈 Dividends (#5DADE2)
- 💻 Freelance (#AF7AC5)
- 💳 Interest (#F4D03F)
- 🏢 Business (#52C41A)
- 📝 Others (#95A5A6)

## Seeder Features

- **Automatic cleanup**: Clears existing category defaults before seeding
- **Color coding**: Each category has a predefined color for UI consistency
- **Type safety**: Uses Prisma enums for category types
- **Error handling**: Proper error handling and logging

## Customization

To modify the default categories, edit the `categoryDefaults` array in `/prisma/seed.ts`:

```typescript
const categoryDefaults = [
  { name: 'Your Category', type: CategoryType.EXPENSE, color: '#FF6B6B' },
  // ... more categories
];
```

## Troubleshooting

### Common Issues:

1. **Import errors**: Make sure Prisma Client is generated
2. **Database connection**: Verify DATABASE_URL in .env
3. **Permission errors**: Check database permissions

### Reset and Re-seed:
```bash
npx prisma db push --force-reset
npm run db:seed
```

## Integration with Development Workflow

Consider adding seeding to your development setup:

```bash
# After database migrations
npx prisma migrate dev
npm run db:seed
```
