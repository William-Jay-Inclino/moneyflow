import { PrismaClient, CategoryType } from '../generated/prisma';

const prisma = new PrismaClient();

const categoryDefaults = [
  // Expense categories
  { name: 'Eating out', type: CategoryType.EXPENSE, color: '#FF6B6B' },
  { name: 'Transportation', type: CategoryType.EXPENSE, color: '#4ECDC4' },
  { name: 'Groceries & Essentials', type: CategoryType.EXPENSE, color: '#45B7D1' },
  { name: 'Utilities', type: CategoryType.EXPENSE, color: '#96CEB4' },
  { name: 'Housing', type: CategoryType.EXPENSE, color: '#FFEAA7' },
  { name: 'Load / Subscriptions', type: CategoryType.EXPENSE, color: '#DDA0DD' },
  { name: 'Healthcare', type: CategoryType.EXPENSE, color: '#98D8C8' },
  { name: 'Insurance', type: CategoryType.EXPENSE, color: '#F7DC6F' },
  { name: 'Shopping', type: CategoryType.EXPENSE, color: '#BB8FCE' },
  { name: 'Entertainment', type: CategoryType.EXPENSE, color: '#85C1E9' },
  { name: 'Savings & Investment', type: CategoryType.EXPENSE, color: '#82E0AA' },
  { name: 'Gifts & Donations', type: CategoryType.EXPENSE, color: '#F8C471' },
  { name: 'Others', type: CategoryType.EXPENSE, color: '#D5DBDB' },

  // Income categories
  { name: 'Salary / Wages', type: CategoryType.INCOME, color: '#58D68D' },
  { name: 'Dividends', type: CategoryType.INCOME, color: '#5DADE2' },
  { name: 'Freelance', type: CategoryType.INCOME, color: '#AF7AC5' },
  { name: 'Interest', type: CategoryType.INCOME, color: '#F4D03F' },
  { name: 'Business', type: CategoryType.INCOME, color: '#52C41A' },
  { name: 'Others', type: CategoryType.INCOME, color: '#95A5A6' },
];

async function main() {
  console.log('🌱 Seeding category defaults...');

  // Clear existing data
  await prisma.categoryDefault.deleteMany();

  // Insert new data
  for (const category of categoryDefaults) {
    await prisma.categoryDefault.create({
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
