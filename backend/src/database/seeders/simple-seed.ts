import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums';

export async function simpleSeed(dataSource: DataSource) {
  console.log('🌱 Starting simple seed...');

  const userRepo = dataSource.getRepository(User);

  // Check if admin user already exists
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@tribecore.com' } });
  
  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    // Create admin user
    const admin = userRepo.create({
      email: 'admin@tribecore.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: [UserRole.ADMIN],
      password: 'Password123!', // Will be hashed automatically
      isActive: true,
      timezone: 'Europe/London',
    });
    
    await userRepo.save(admin);
    console.log('✅ Admin user created: admin@tribecore.com / Password123!');
  }

  // Create test employee if doesn't exist
  const existingEmployee = await userRepo.findOne({ where: { email: 'employee@tribecore.com' } });
  
  if (!existingEmployee) {
    const employee = userRepo.create({
      email: 'employee@tribecore.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [UserRole.EMPLOYEE],
      password: 'Password123!',
      isActive: true,
      timezone: 'Europe/London',
    });
    
    await userRepo.save(employee);
    console.log('✅ Employee user created: employee@tribecore.com / Password123!');
  } else {
    console.log('✅ Employee user already exists');
  }

  console.log('\n🎉 Simple seed completed!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@tribecore.com / Password123!');
  console.log('   Employee: employee@tribecore.com / Password123!\n');
}
