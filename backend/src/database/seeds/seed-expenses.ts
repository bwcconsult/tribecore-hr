import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../modules/users/entities/user.entity';
import { TaxCode } from '../../modules/expenses/entities/tax-code.entity';
import { Currency } from '../../modules/expenses/entities/currency.entity';
import { ExpenseCategory } from '../../modules/expenses/entities/expense-category.entity';
import { Project } from '../../modules/expenses/entities/project.entity';
import { ExpenseClaim, ClaimStatus } from '../../modules/expenses/entities/expense-claim.entity';
import { ExpenseItem } from '../../modules/expenses/entities/expense-item.entity';

export async function seedExpenses(dataSource: DataSource) {
  console.log('🌱 Seeding expenses data...');

  const seedData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'seed-expenses-data.json'),
      'utf-8'
    )
  );

  const taxCodeRepo = dataSource.getRepository(TaxCode);
  const currencyRepo = dataSource.getRepository(Currency);
  const categoryRepo = dataSource.getRepository(ExpenseCategory);
  const userRepo = dataSource.getRepository(User);
  const projectRepo = dataSource.getRepository(Project);
  const claimRepo = dataSource.getRepository(ExpenseClaim);
  const itemRepo = dataSource.getRepository(ExpenseItem);

  // Seed Tax Codes
  console.log('  ↳ Seeding tax codes...');
  const taxIndex: Record<string, string> = {};
  for (const t of seedData.taxCodes) {
    const existing = await taxCodeRepo.findOne({ where: { code: t.code } });
    if (!existing) {
      const saved = await taxCodeRepo.save(taxCodeRepo.create(t));
      taxIndex[t.code] = saved.id;
    } else {
      taxIndex[t.code] = existing.id;
    }
  }

  // Seed Currencies
  console.log('  ↳ Seeding currencies...');
  for (const c of seedData.currencies) {
    const existing = await currencyRepo.findOne({ where: { code: c.code } });
    if (!existing) {
      await currencyRepo.save(currencyRepo.create(c));
    } else {
      await currencyRepo.save({ ...existing, fxToBase: c.fxToBase });
    }
  }

  // Seed Categories
  console.log('  ↳ Seeding expense categories...');
  const catIds: Record<string, string> = {};
  for (const cat of seedData.categories) {
    const existing = await categoryRepo.findOne({ where: { uniqueCode: cat.uniqueCode } });
    const categoryData: any = {
      name: cat.name,
      uniqueCode: cat.uniqueCode,
      glCode: cat.glCode,
      description: cat.description,
      requiresReceipt: cat.requiresReceipt ?? true,
      perDiemAllowed: cat.perDiemAllowed ?? false,
      limitPerDay: cat.limitPerDay || undefined,
      limitPerTxn: cat.limitPerTxn || undefined,
      limitPerTrip: cat.limitPerTrip || undefined,
      taxCodeId: cat.taxCode ? taxIndex[cat.taxCode] : undefined,
      active: true,
    };

    if (!existing) {
      const saved = await categoryRepo.save(categoryRepo.create(categoryData));
      catIds[cat.uniqueCode] = saved.id;
    } else {
      const updated = await categoryRepo.save({ ...existing, ...categoryData });
      catIds[cat.uniqueCode] = updated.id;
    }
  }

  // Seed Users
  console.log('  ↳ Seeding users...');
  const users: Record<string, string> = {};
  for (const u of seedData.users) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    const [firstName, ...lastNameParts] = u.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    if (!user) {
      user = userRepo.create({
        email: u.email,
        firstName,
        lastName,
        roles: [u.role],
        password: 'Password123!', // Will be hashed by entity hook
        isActive: true,
        timezone: 'Europe/London',
      });
      await userRepo.save(user);
    }
    users[u.email] = user.id;
  }

  // Seed Projects
  console.log('  ↳ Seeding projects...');
  const projects: Record<string, string> = {};
  for (const p of seedData.projects) {
    let project = await projectRepo.findOne({ where: { code: p.code } });
    if (!project) {
      project = projectRepo.create({
        code: p.code,
        name: p.name,
        budget: p.budget || null,
      });
      await projectRepo.save(project);
    }
    projects[p.code] = project.id;
  }

  // Seed Claims and Items
  console.log('  ↳ Seeding expense claims...');
  for (const claimData of seedData.claims) {
    const createdById = users[claimData.createdBy];
    if (!createdById) {
      console.warn(`    ⚠️  User not found: ${claimData.createdBy}, skipping claim`);
      continue;
    }

    const projectId = claimData.project ? projects[claimData.project] : null;

    // Check if claim already exists
    const existingClaim = await claimRepo.findOne({
      where: { title: claimData.title, createdById },
    });

    if (existingClaim) {
      console.log(`    ↳ Claim "${claimData.title}" already exists, skipping`);
      continue;
    }

    let claim = claimRepo.create({
      title: claimData.title,
      status: ClaimStatus[claimData.status as keyof typeof ClaimStatus],
      currencyCode: claimData.currency,
      createdById,
      projectId: projectId || undefined,
      totalAmount: 0,
    });

    claim = await claimRepo.save(claim);

    let total = 0;
    for (const item of claimData.items) {
      const categoryId = catIds[item.category];
      const taxCodeId = item.taxCode ? taxIndex[item.taxCode] : undefined;
      const amount = item.amount ?? 0;
      total += amount;

      await itemRepo.save(itemRepo.create({
        claimId: claim.id,
        categoryId,
        txnDate: new Date(item.txnDate),
        amount,
        currencyCode: claimData.currency,
        merchant: item.merchant || undefined,
        description: item.description || undefined,
        taxCodeId,
        receiptUrl: item.receiptUrl || undefined,
        distanceKm: item.distanceKm || undefined,
      }));
    }

    claim.totalAmount = total;
    await claimRepo.save(claim);
  }

  console.log('✅ Expense seeding complete!');
}
