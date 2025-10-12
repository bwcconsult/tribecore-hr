import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'tribecore',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Only true for this init script!
  dropSchema: false, // Don't drop existing data
  logging: true,
});

async function initializeSchema() {
  console.log('🔧 Initializing database schema...');
  console.log('📍 Database:', process.env.DATABASE_NAME || 'tribecore');
  console.log('📍 Host:', process.env.DATABASE_HOST || 'localhost');
  
  try {
    console.log('\n🚀 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('\n📝 Synchronizing schema (this may take a moment)...');
    await AppDataSource.synchronize();
    console.log('✅ Schema synchronized successfully');

    console.log('\n🎉 Database schema initialization complete!');
    console.log('\nℹ️  Tables created:');
    console.log('   - user');
    console.log('   - expense_claim');
    console.log('   - expense_item');
    console.log('   - expense_category');
    console.log('   - receipt');
    console.log('   - approval');
    console.log('   - policy_rule');
    console.log('   - reimbursement');
    console.log('   - audit_trail');
    console.log('   - budget');
    console.log('   - exchange_rate');
    console.log('   - approval_rules');
    console.log('   - and all other entities...\n');

    console.log('📌 Next step: Run the seeder to populate sample data');
    console.log('   npm run seed\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Schema initialization failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check database connection details in .env');
    console.error('2. Ensure PostgreSQL is running');
    console.error('3. Verify database exists: ' + (process.env.DATABASE_NAME || 'tribecore'));
    console.error('4. Check user permissions\n');
    
    process.exit(1);
  }
}

initializeSchema();
