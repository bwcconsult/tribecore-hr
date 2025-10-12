import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { simpleSeed } from '../database/seeders/simple-seed';

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
  synchronize: false, // Don't auto-sync to avoid conflicts
});

async function runSeeder() {
  console.log('🚀 Connecting to database...');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    console.log('\n🌱 Running simple seeder...\n');
    await simpleSeed(AppDataSource);

    console.log('\n✅ All seeders completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('Error details:', error.message);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

runSeeder();
