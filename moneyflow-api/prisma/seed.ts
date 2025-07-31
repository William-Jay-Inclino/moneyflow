import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const categoryDefaults = [
  // Income categories - common ones marked as default
  { name: 'Salary / Wages', type: CategoryType.INCOME, color: '#58D68D', icon: '💼', is_default: true },
  { name: 'Freelance', type: CategoryType.INCOME, color: '#AF7AC5', icon: '💻', is_default: true },
  { name: 'Investment', type: CategoryType.INCOME, color: '#F4D03F', icon: '📈', is_default: true },
  { name: 'Business', type: CategoryType.INCOME, color: '#52C41A', icon: '🏢', is_default: false },
  { name: 'Rental Income', type: CategoryType.INCOME, color: '#85C1E9', icon: '🏠', is_default: false },
  { name: 'Dividends', type: CategoryType.INCOME, color: '#5DADE2', icon: '💰', is_default: false },
  { name: 'Bonus', type: CategoryType.INCOME, color: '#82E0AA', icon: '🎁', is_default: true },
  { name: 'Commission', type: CategoryType.INCOME, color: '#F8C471', icon: '🤝', is_default: false },
  { name: 'Royalties', type: CategoryType.INCOME, color: '#BB8FCE', icon: '👑', is_default: false },
  { name: 'Side Hustle', type: CategoryType.INCOME, color: '#F7DC6F', icon: '🔥', is_default: false },
  { name: 'Pension', type: CategoryType.INCOME, color: '#98D8C8', icon: '👴', is_default: false },
  { name: 'Grants', type: CategoryType.INCOME, color: '#85C1E9', icon: '🎯', is_default: false },
  { name: 'Cashback', type: CategoryType.INCOME, color: '#58D68D', icon: '💳', is_default: true },
  { name: 'Gifts Received', type: CategoryType.INCOME, color: '#F8C471', icon: '🎀', is_default: false },
  { name: 'Savings Interest', type: CategoryType.INCOME, color: '#40E0D0', icon: '🏦', is_default: true },
  { name: 'Other Income', type: CategoryType.INCOME, color: '#95A5A6', icon: '💎', is_default: false },

  // Expense categories - common ones marked as default
  { name: 'Food & Dining', type: CategoryType.EXPENSE, color: '#FF6B6B', icon: '🍽️', is_default: true },
  { name: 'Transportation', type: CategoryType.EXPENSE, color: '#4ECDC4', icon: '🚗', is_default: true },
  { name: 'Entertainment', type: CategoryType.EXPENSE, color: '#85C1E9', icon: '🎬', is_default: true },
  { name: 'Utilities', type: CategoryType.EXPENSE, color: '#96CEB4', icon: '⚡', is_default: true },
  { name: 'Shopping', type: CategoryType.EXPENSE, color: '#BB8FCE', icon: '🛍️', is_default: true },
  { name: 'Healthcare', type: CategoryType.EXPENSE, color: '#98D8C8', icon: '🏥', is_default: false },
  { name: 'Education', type: CategoryType.EXPENSE, color: '#F7DC6F', icon: '📚', is_default: false },
  { name: 'Insurance', type: CategoryType.EXPENSE, color: '#F7DC6F', icon: '🛡️', is_default: false },
  { name: 'Groceries', type: CategoryType.EXPENSE, color: '#45B7D1', icon: '🛒', is_default: true },
  { name: 'Gas & Fuel', type: CategoryType.EXPENSE, color: '#82E0AA', icon: '⛽', is_default: true },
  { name: 'Home & Garden', type: CategoryType.EXPENSE, color: '#FFEAA7', icon: '🏡', is_default: false },
  { name: 'Personal Care', type: CategoryType.EXPENSE, color: '#DDA0DD', icon: '💅', is_default: false },
  { name: 'Fitness & Sports', type: CategoryType.EXPENSE, color: '#F8C471', icon: '🏋️', is_default: false },
  { name: 'Travel', type: CategoryType.EXPENSE, color: '#85C1E9', icon: '✈️', is_default: false },
  { name: 'Subscriptions', type: CategoryType.EXPENSE, color: '#DDA0DD', icon: '📺', is_default: true },
  { name: 'Phone & Internet', type: CategoryType.EXPENSE, color: '#4ECDC4', icon: '📱', is_default: true },
  { name: 'Banking & Fees', type: CategoryType.EXPENSE, color: '#96CEB4', icon: '🏦', is_default: false },
  { name: 'Taxes', type: CategoryType.EXPENSE, color: '#98D8C8', icon: '📋', is_default: false },
  { name: 'Gifts & Donations', type: CategoryType.EXPENSE, color: '#F8C471', icon: '🎁', is_default: false },
  { name: 'Other Expenses', type: CategoryType.EXPENSE, color: '#D5DBDB', icon: '📦', is_default: false },
];

async function main() {
  console.log('🌱 Seeding category defaults...');

  // Clear existing data
  await prisma.category.deleteMany();

  // Insert new data
  for (const category of categoryDefaults) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log('✅ Category defaults seeded successfully!');
  console.log(`📊 Created ${categoryDefaults.length} default categories`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding data:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
