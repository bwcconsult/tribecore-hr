import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedExpenses } from './seed-expenses';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'tribecore',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true, // Auto-create tables for demo
});

async function runSeeder() {
  console.log('🚀 Connecting to database...');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    await seedExpenses(AppDataSource);

    console.log('\n✅ Seeding completed!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeder();
