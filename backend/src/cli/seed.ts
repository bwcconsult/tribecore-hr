import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedExpenseData } from '../database/seeders/expense-data.seeder';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'tribecore',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function runSeeder() {
  console.log('🚀 Connecting to database...');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('\n🌱 Running expense data seeder...\n');
    await seedExpenseData(AppDataSource);

    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
