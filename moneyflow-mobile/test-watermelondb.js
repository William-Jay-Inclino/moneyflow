// Simple test to verify WatermelonDB setup
const Database = require('@nozbe/watermelondb/Database').default;
const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;

const schema = {
  version: 1,
  tables: [
    {
      name: 'expenses',
      columns: [
        { name: 'user_id', type: 'number' },
        { name: 'category_id', type: 'number' },
        { name: 'amount', type: 'number' },
        { name: 'notes', type: 'string' },
        { name: 'expense_date', type: 'string' },
        { name: 'api_id', type: 'number', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }
  ]
};

try {
  const adapter = new SQLiteAdapter({
    schema,
    dbName: 'test_moneyflow'
  });
  
  const database = new Database({
    adapter,
    modelClasses: []
  });
  
  console.log('✅ WatermelonDB setup successful!');
  console.log('Database:', database);
  console.log('Adapter:', adapter);
} catch (error) {
  console.error('❌ WatermelonDB setup failed:', error);
}
