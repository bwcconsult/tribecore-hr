import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function seedExpenseData(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🌱 Starting expense data seeding...');

    // 1. Create test users if they don't exist
    console.log('👥 Creating test users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Generate UUIDs for users
    const userEmployee1 = uuidv4();
    const userEmployee2 = uuidv4();
    const userEmployee3 = uuidv4();
    const userManager1 = uuidv4();
    const userAdmin1 = uuidv4();
    const userFinance1 = uuidv4();
    
    // Employee
    await queryRunner.query(`
      INSERT INTO "users" (id, email, password, "firstName", "lastName", roles, "isActive")
      VALUES 
        ('${userEmployee1}', 'john.doe@tribecore.com', '${hashedPassword}', 'John', 'Doe', ARRAY['EMPLOYEE']::text[], true),
        ('${userEmployee2}', 'jane.smith@tribecore.com', '${hashedPassword}', 'Jane', 'Smith', ARRAY['EMPLOYEE']::text[], true),
        ('${userEmployee3}', 'bob.johnson@tribecore.com', '${hashedPassword}', 'Bob', 'Johnson', ARRAY['EMPLOYEE']::text[], true)
      ON CONFLICT (email) DO NOTHING
    `);

    // Manager
    await queryRunner.query(`
      INSERT INTO "users" (id, email, password, "firstName", "lastName", roles, "isActive")
      VALUES 
        ('${userManager1}', 'manager@tribecore.com', '${hashedPassword}', 'Sarah', 'Manager', ARRAY['MANAGER']::text[], true)
      ON CONFLICT (email) DO NOTHING
    `);

    // Admin/Finance
    await queryRunner.query(`
      INSERT INTO "users" (id, email, password, "firstName", "lastName", roles, "isActive")
      VALUES 
        ('${userAdmin1}', 'admin@tribecore.com', '${hashedPassword}', 'Admin', 'User', ARRAY['ADMIN']::text[], true),
        ('${userFinance1}', 'finance@tribecore.com', '${hashedPassword}', 'Finance', 'Manager', ARRAY['FINANCE']::text[], true)
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✅ Test users created');

    // 2. Seed Expense Categories
    console.log('📂 Seeding expense categories...');
    
    await queryRunner.query(`
      INSERT INTO expense_category (id, name, description, type, "isActive", "maxAmount", "requiresReceipt")
      VALUES 
        ('cat-travel', 'Travel', 'Flights, trains, taxis, and other transportation', 'TRAVEL', true, 5000, true),
        ('cat-accommodation', 'Accommodation', 'Hotels, Airbnb, and other lodging', 'ACCOMMODATION', true, 3000, true),
        ('cat-meals', 'Meals & Entertainment', 'Client dinners, team lunches, business meals', 'MEALS', true, 500, true),
        ('cat-office', 'Office Supplies', 'Stationery, equipment, software licenses', 'OFFICE_SUPPLIES', true, 1000, false),
        ('cat-telecom', 'Telecommunications', 'Phone bills, internet, mobile data', 'TELECOM', true, 200, true),
        ('cat-parking', 'Parking & Tolls', 'Parking fees, toll charges', 'PARKING', true, 100, true),
        ('cat-fuel', 'Fuel', 'Vehicle fuel and mileage', 'FUEL', true, 500, true),
        ('cat-training', 'Training & Development', 'Courses, certifications, conferences', 'TRAINING', true, 2000, true),
        ('cat-subscriptions', 'Subscriptions', 'Software subscriptions, memberships', 'SUBSCRIPTIONS', true, 500, false),
        ('cat-marketing', 'Marketing & Advertising', 'Promotional materials, advertising costs', 'MARKETING', true, 5000, true),
        ('cat-other', 'Other', 'Miscellaneous business expenses', 'OTHER', true, 1000, false)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Categories seeded');

    // 3. Seed Budgets
    console.log('💰 Seeding budgets...');
    
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    await queryRunner.query(`
      INSERT INTO budget (id, name, amount, "startDate", "endDate", "departmentId", "isActive")
      VALUES 
        ('budget-1', 'Q4 ${currentYear} General Expenses', 50000, '${currentYear}-10-01', '${currentYear}-12-31', NULL, true),
        ('budget-2', 'Annual Travel Budget ${currentYear}', 75000, '${startDate}', '${endDate}', NULL, true),
        ('budget-3', 'Training & Development ${currentYear}', 25000, '${startDate}', '${endDate}', NULL, true)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Budgets seeded');

    // 4. Seed Approval Rules
    console.log('⚙️ Seeding approval rules...');
    
    await queryRunner.query(`
      INSERT INTO approval_rules (id, name, description, type, action, priority, "isActive", conditions, "approvalConfig")
      VALUES 
        (
          'rule-auto-small',
          'Auto-approve small expenses',
          'Automatically approve expenses under £50',
          'AMOUNT_THRESHOLD',
          'AUTO_APPROVE',
          1,
          true,
          '{"maxAmount": 50, "currency": "GBP"}',
          '{"autoApprove": true, "autoApproveReason": "Amount under £50 threshold"}'
        ),
        (
          'rule-single-medium',
          'Single approval for medium expenses',
          'Require single manager approval for £50-£500',
          'AMOUNT_THRESHOLD',
          'REQUIRE_APPROVAL',
          2,
          true,
          '{"minAmount": 50, "maxAmount": 500, "currency": "GBP"}',
          '{"approverRoles": ["MANAGER"], "requiredApprovals": 1}'
        ),
        (
          'rule-multi-large',
          'Multi-level for large expenses',
          'Require manager and finance approval for expenses over £500',
          'AMOUNT_THRESHOLD',
          'REQUIRE_MULTI_LEVEL',
          3,
          true,
          '{"minAmount": 500, "currency": "GBP"}',
          '{"approverRoles": ["MANAGER", "FINANCE"], "requiredApprovals": 2}'
        ),
        (
          'rule-travel-finance',
          'Finance approval for travel',
          'All travel expenses require finance approval',
          'CATEGORY',
          'REQUIRE_APPROVAL',
          4,
          true,
          '{"categoryTypes": ["TRAVEL"]}',
          '{"approverRoles": ["FINANCE"], "requiredApprovals": 1}'
        )
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Approval rules seeded');

    // 5. Create Sample Expense Claims
    console.log('💳 Creating sample expense claims...');
    
    // Generate claim IDs
    const claim1 = uuidv4();
    const claim2 = uuidv4();
    const claim3 = uuidv4();
    const claim4 = uuidv4();
    const claim5 = uuidv4();
    
    const claims = [
      // Recent approved claim
      {
        id: claim1,
        title: 'Business Trip to London',
        description: 'Client meeting and conference attendance',
        totalAmount: 450.00,
        currency: 'GBP',
        status: 'APPROVED',
        employeeId: userEmployee1,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      // Pending approval
      {
        id: claim2,
        title: 'Office Equipment Purchase',
        description: 'New laptop and accessories',
        totalAmount: 1200.00,
        currency: 'GBP',
        status: 'PENDING_APPROVAL',
        employeeId: userEmployee2,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      // Draft
      {
        id: claim3,
        title: 'Monthly Phone Bill',
        description: 'Mobile phone expenses',
        totalAmount: 45.00,
        currency: 'GBP',
        status: 'DRAFT',
        employeeId: userEmployee3,
        submittedAt: null,
      },
      // Paid claim
      {
        id: claim4,
        title: 'Training Course - AWS Certification',
        description: 'AWS Solutions Architect certification exam and training',
        totalAmount: 800.00,
        currency: 'GBP',
        status: 'PAID',
        employeeId: userEmployee1,
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      // Recent submission
      {
        id: claim5,
        title: 'Client Lunch - Q4 Review',
        description: 'Business lunch with key client',
        totalAmount: 125.50,
        currency: 'GBP',
        status: 'SUBMITTED',
        employeeId: userEmployee2,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    for (const claim of claims) {
      const submittedAtSQL = claim.submittedAt ? `'${claim.submittedAt.toISOString()}'` : 'NULL';
      await queryRunner.query(`
        INSERT INTO expense_claim (id, title, description, "totalAmount", currency, status, "employeeId", "submittedAt", "createdAt", "updatedAt")
        VALUES ('${claim.id}', '${claim.title}', '${claim.description}', ${claim.totalAmount}, '${claim.currency}', '${claim.status}', '${claim.employeeId}', ${submittedAtSQL}, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `);
    }

    console.log('✅ Sample claims created');

    // 6. Create Expense Items for each claim
    console.log('📝 Creating expense items...');
    
    const items = [
      // Claim 1 items (use category IDs from earlier seeding)
      { id: uuidv4(), claimId: claim1, categoryId: 'cat-travel', amount: 150.00, description: 'Train ticket to London', vendor: 'Virgin Trains', expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), claimId: claim1, categoryId: 'cat-accommodation', amount: 180.00, description: 'Hotel stay (1 night)', vendor: 'Premier Inn', expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), claimId: claim1, categoryId: 'cat-meals', amount: 120.00, description: 'Client dinner', vendor: 'The Ivy Restaurant', expenseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      
      // Claim 2 items
      { id: uuidv4(), claimId: claim2, categoryId: 'cat-office', amount: 1200.00, description: 'MacBook Pro 14"', vendor: 'Apple Store', expenseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      
      // Claim 3 items
      { id: uuidv4(), claimId: claim3, categoryId: 'cat-telecom', amount: 45.00, description: 'Monthly mobile bill', vendor: 'Vodafone', expenseDate: new Date() },
      
      // Claim 4 items
      { id: uuidv4(), claimId: claim4, categoryId: 'cat-training', amount: 800.00, description: 'AWS Solutions Architect certification', vendor: 'AWS Training', expenseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      
      // Claim 5 items
      { id: uuidv4(), claimId: claim5, categoryId: 'cat-meals', amount: 125.50, description: 'Business lunch', vendor: 'Gaucho Grill', expenseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ];

    for (const item of items) {
      await queryRunner.query(`
        INSERT INTO expense_item (id, "claimId", "categoryId", amount, currency, description, vendor, "expenseDate", "createdAt", "updatedAt")
        VALUES ('${item.id}', '${item.claimId}', '${item.categoryId}', ${item.amount}, 'GBP', '${item.description}', '${item.vendor}', '${item.expenseDate.toISOString()}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `);
    }

    console.log('✅ Expense items created');

    // 7. Create Approvals for appropriate claims
    console.log('✅ Creating approvals...');
    
    await queryRunner.query(`
      INSERT INTO approval (id, "claimId", "approverId", "approverLevel", status, "approvedAt")
      VALUES 
        ('${uuidv4()}', '${claim1}', '${userManager1}', 1, 'APPROVED', NOW() - INTERVAL '4 days'),
        ('${uuidv4()}', '${claim2}', '${userManager1}', 1, 'PENDING', NULL),
        ('${uuidv4()}', '${claim4}', '${userManager1}', 1, 'APPROVED', NOW() - INTERVAL '29 days'),
        ('${uuidv4()}', '${claim5}', '${userManager1}', 1, 'PENDING', NULL)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Approvals created');

    // 8. Create Reimbursements for paid claims
    console.log('💸 Creating reimbursements...');
    
    await queryRunner.query(`
      INSERT INTO reimbursement (id, "claimId", amount, currency, method, "processedBy", "processedAt", status)
      VALUES 
        ('${uuidv4()}', '${claim1}', 450.00, 'GBP', 'BANK_TRANSFER', '${userFinance1}', NOW() - INTERVAL '2 days', 'PROCESSED'),
        ('${uuidv4()}', '${claim4}', 800.00, 'GBP', 'BANK_TRANSFER', '${userFinance1}', NOW() - INTERVAL '25 days', 'PROCESSED')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Reimbursements created');

    // 9. Seed Exchange Rates
    console.log('💱 Seeding exchange rates...');
    
    await queryRunner.query(`
      INSERT INTO exchange_rate ("fromCurrency", "toCurrency", rate, "effectiveDate")
      VALUES 
        ('USD', 'GBP', 0.79, NOW()),
        ('EUR', 'GBP', 0.86, NOW()),
        ('GBP', 'USD', 1.27, NOW()),
        ('GBP', 'EUR', 1.16, NOW()),
        ('USD', 'EUR', 0.92, NOW()),
        ('EUR', 'USD', 1.09, NOW())
      ON CONFLICT ("fromCurrency", "toCurrency", "effectiveDate") DO NOTHING
    `);

    console.log('✅ Exchange rates seeded');

    await queryRunner.commitTransaction();
    console.log('🎉 Expense data seeding completed successfully!');
    
    console.log('\n📋 Test Credentials:');
    console.log('Employee: john.doe@tribecore.com / password123');
    console.log('Manager: manager@tribecore.com / password123');
    console.log('Admin: admin@tribecore.com / password123');
    console.log('Finance: finance@tribecore.com / password123\n');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding expense data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
