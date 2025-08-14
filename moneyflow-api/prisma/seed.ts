import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const categoryDefaults = [
  // Income categories - common ones marked as default
  { id: 1, name: 'Salary / Wages', type: CategoryType.INCOME, color: '#58D68D', icon: '💼', is_default: true },
  { id: 2, name: 'Freelance', type: CategoryType.INCOME, color: '#AF7AC5', icon: '💻', is_default: true },
  { id: 3, name: 'Investment', type: CategoryType.INCOME, color: '#F4D03F', icon: '📈', is_default: true },
  { id: 4, name: 'Business', type: CategoryType.INCOME, color: '#52C41A', icon: '🏢', is_default: false },
  { id: 5, name: 'Rental Income', type: CategoryType.INCOME, color: '#85C1E9', icon: '🏠', is_default: false },
  { id: 6, name: 'Dividends', type: CategoryType.INCOME, color: '#5DADE2', icon: '💰', is_default: false },
  { id: 7, name: 'Bonus', type: CategoryType.INCOME, color: '#82E0AA', icon: '🎁', is_default: true },
  { id: 8, name: 'Commission', type: CategoryType.INCOME, color: '#F8C471', icon: '🤝', is_default: false },
  { id: 9, name: 'Royalties', type: CategoryType.INCOME, color: '#BB8FCE', icon: '👑', is_default: false },
  { id: 10, name: 'Side Hustle', type: CategoryType.INCOME, color: '#F7DC6F', icon: '🔥', is_default: false },
  { id: 11, name: 'Pension', type: CategoryType.INCOME, color: '#98D8C8', icon: '👴', is_default: false },
  { id: 12, name: 'Grants', type: CategoryType.INCOME, color: '#85C1E9', icon: '🎯', is_default: false },
  { id: 13, name: 'Cashback', type: CategoryType.INCOME, color: '#58D68D', icon: '💳', is_default: true },
  { id: 14, name: 'Gifts Received', type: CategoryType.INCOME, color: '#F8C471', icon: '🎀', is_default: false },
  { id: 15, name: 'Other Income', type: CategoryType.INCOME, color: '#95A5A6', icon: '💎', is_default: false },

  // Expense categories - common ones marked as default
  { id: 16, name: 'Food & Dining', type: CategoryType.EXPENSE, color: '#FF6B6B', icon: '🍽️', is_default: true },
  { id: 17, name: 'Transportation', type: CategoryType.EXPENSE, color: '#4ECDC4', icon: '🚕', is_default: true },
  { id: 18, name: 'Entertainment', type: CategoryType.EXPENSE, color: '#85C1E9', icon: '🎬', is_default: true },
  { id: 19, name: 'Utilities', type: CategoryType.EXPENSE, color: '#96CEB4', icon: '⚡', is_default: true },
  { id: 20, name: 'Shopping', type: CategoryType.EXPENSE, color: '#BB8FCE', icon: '🛍️', is_default: true },
  { id: 21, name: 'Healthcare', type: CategoryType.EXPENSE, color: '#98D8C8', icon: '🏥', is_default: false },
  { id: 22, name: 'Education', type: CategoryType.EXPENSE, color: '#F7DC6F', icon: '📚', is_default: false },
  { id: 23, name: 'Insurance', type: CategoryType.EXPENSE, color: '#F7DC6F', icon: '🛡️', is_default: false },
  { id: 24, name: 'Groceries', type: CategoryType.EXPENSE, color: '#45B7D1', icon: '🛒', is_default: true },
  { id: 25, name: 'Gas & Fuel', type: CategoryType.EXPENSE, color: '#82E0AA', icon: '⛽', is_default: true },
  { id: 26, name: 'Home & Garden', type: CategoryType.EXPENSE, color: '#FFEAA7', icon: '🏡', is_default: false },
  { id: 27, name: 'Personal Care', type: CategoryType.EXPENSE, color: '#DDA0DD', icon: '💅', is_default: false },
  { id: 28, name: 'Fitness & Sports', type: CategoryType.EXPENSE, color: '#F8C471', icon: '🏋️', is_default: false },
  { id: 29, name: 'Travel', type: CategoryType.EXPENSE, color: '#85C1E9', icon: '✈️', is_default: false },
  { id: 30, name: 'Subscriptions', type: CategoryType.EXPENSE, color: '#DDA0DD', icon: '📺', is_default: true },
  { id: 31, name: 'Phone & Internet', type: CategoryType.EXPENSE, color: '#4ECDC4', icon: '📱', is_default: true },
  { id: 32, name: 'Banking & Fees', type: CategoryType.EXPENSE, color: '#96CEB4', icon: '🏦', is_default: false },
  { id: 33, name: 'Taxes', type: CategoryType.EXPENSE, color: '#98D8C8', icon: '📋', is_default: false },
  { id: 34, name: 'Gifts & Donations', type: CategoryType.EXPENSE, color: '#F8C471', icon: '🎁', is_default: false },
  { id: 35, name: 'Other Expenses', type: CategoryType.EXPENSE, color: '#D5DBDB', icon: '📦', is_default: false },

  // newly added categories
  { id: 36, name: 'Funding / Goals', type: CategoryType.EXPENSE, color: '#F4A261', icon: '🪙', is_default: false },
  { id: 37, name: 'Car Expenses', type: CategoryType.EXPENSE, color: '#FFA07A', icon: '🚗', is_default: false },
  { id: 38, name: 'Motor Expenses', type: CategoryType.EXPENSE, color: '#FFB347', icon: '🏍️', is_default: false },
  { id: 39, name: 'Possessions', type: CategoryType.EXPENSE, color: '#C39BD3', icon: '🧰', is_default: true },
  { id: 40, name: 'Savings Interest', type: CategoryType.INCOME, color: '#40E0D0', icon: '🏦', is_default: true },
  { id: 41, name: 'Money Lent', type: CategoryType.EXPENSE, color: '#F39C12', icon: '💸', is_default: false },
  { id: 42, name: 'Loan Repayment Received', type: CategoryType.INCOME, color: '#27AE60', icon: '✅', is_default: false },
  { id: 43, name: 'Loan Borrowed', type: CategoryType.INCOME, color: '#3498DB', icon: '🤲', is_default: false },
  { id: 44, name: 'Loan Repayment', type: CategoryType.EXPENSE, color: '#E74C3C', icon: '⬇️', is_default: false },
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
