#!/usr/bin/env node

/**
 * TribeCore Setup Verification Script
 * Run this to verify your installation is correct
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkExists(filePath, name) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${name}`, 'green');
    return true;
  } else {
    log(`❌ ${name} - NOT FOUND`, 'red');
    return false;
  }
}

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'ignore' });
    const version = execSync(command, { encoding: 'utf-8' }).trim();
    log(`✅ ${name} - ${version}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name} - NOT INSTALLED`, 'red');
    return false;
  }
}

function checkNodeModules(dir, name) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  const packageJsonPath = path.join(dir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log(`❌ ${name} - package.json not found`, 'red');
    return false;
  }

  if (!fs.existsSync(nodeModulesPath)) {
    log(`❌ ${name} - node_modules not found (run npm install)`, 'red');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const totalDeps = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }).length;

  const installedCount = fs.readdirSync(nodeModulesPath).length;
  
  if (installedCount > 0) {
    log(`✅ ${name} - ${installedCount} packages installed`, 'green');
    return true;
  } else {
    log(`❌ ${name} - No packages installed`, 'red');
    return false;
  }
}

function checkEnvFile(filePath, name) {
  if (!fs.existsSync(filePath)) {
    log(`⚠️  ${name} - Not configured`, 'yellow');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  if (lines.length > 0) {
    log(`✅ ${name} - ${lines.length} variables set`, 'green');
    return true;
  } else {
    log(`⚠️  ${name} - File exists but empty`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════╗', 'cyan');
  log('║   TribeCore Setup Verification Script    ║', 'cyan');
  log('╚═══════════════════════════════════════════╝\n', 'cyan');

  let totalChecks = 0;
  let passedChecks = 0;

  // Check Node.js and npm
  log('\n📋 Checking Prerequisites:', 'blue');
  totalChecks += 2;
  if (checkCommand('node --version', 'Node.js')) passedChecks++;
  if (checkCommand('npm --version', 'npm')) passedChecks++;

  // Check Docker (optional)
  log('\n🐳 Checking Docker (Optional):', 'blue');
  try {
    execSync('docker --version', { stdio: 'ignore' });
    log('✅ Docker is installed', 'green');
  } catch {
    log('⚠️  Docker not installed (optional)', 'yellow');
  }

  // Check project structure
  log('\n📁 Checking Project Structure:', 'blue');
  const criticalFiles = [
    ['backend/package.json', 'Backend package.json'],
    ['frontend/package.json', 'Frontend package.json'],
    ['docker-compose.yml', 'Docker Compose config'],
    ['README.md', 'README documentation'],
  ];

  criticalFiles.forEach(([file, name]) => {
    totalChecks++;
    if (checkExists(file, name)) passedChecks++;
  });

  // Check backend structure
  log('\n🔧 Checking Backend Structure:', 'blue');
  const backendDirs = [
    ['backend/src', 'Backend source'],
    ['backend/src/modules', 'Backend modules'],
    ['backend/src/common', 'Backend common'],
  ];

  backendDirs.forEach(([dir, name]) => {
    totalChecks++;
    if (checkExists(dir, name)) passedChecks++;
  });

  // Check frontend structure
  log('\n🎨 Checking Frontend Structure:', 'blue');
  const frontendDirs = [
    ['frontend/src', 'Frontend source'],
    ['frontend/src/pages', 'Frontend pages'],
    ['frontend/src/components', 'Frontend components'],
  ];

  frontendDirs.forEach(([dir, name]) => {
    totalChecks++;
    if (checkExists(dir, name)) passedChecks++;
  });

  // Check dependencies
  log('\n📦 Checking Dependencies:', 'blue');
  totalChecks += 2;
  if (checkNodeModules('backend', 'Backend dependencies')) passedChecks++;
  if (checkNodeModules('frontend', 'Frontend dependencies')) passedChecks++;

  // Check environment files
  log('\n⚙️  Checking Environment Configuration:', 'blue');
  totalChecks += 2;
  if (checkEnvFile('backend/.env', 'Backend .env')) passedChecks++;
  if (checkEnvFile('frontend/.env', 'Frontend .env')) passedChecks++;

  // Check documentation
  log('\n📚 Checking Documentation:', 'blue');
  const docs = [
    'README.md',
    'START_HERE.md',
    'GETTING_STARTED.md',
    'INSTALLATION_GUIDE.md',
    'DEPLOYMENT.md',
  ];

  docs.forEach(doc => {
    totalChecks++;
    if (checkExists(doc, doc)) passedChecks++;
  });

  // Summary
  log('\n═══════════════════════════════════════════', 'cyan');
  log('📊 SUMMARY', 'cyan');
  log('═══════════════════════════════════════════', 'cyan');
  
  const percentage = Math.round((passedChecks / totalChecks) * 100);
  const status = percentage === 100 ? '🎉 PERFECT!' : 
                 percentage >= 80 ? '✅ GOOD' : 
                 percentage >= 60 ? '⚠️  NEEDS WORK' : '❌ ISSUES FOUND';
  
  log(`\nPassed: ${passedChecks}/${totalChecks} (${percentage}%)`, 
      percentage === 100 ? 'green' : percentage >= 80 ? 'yellow' : 'red');
  log(`Status: ${status}\n`, 
      percentage === 100 ? 'green' : percentage >= 80 ? 'yellow' : 'red');

  if (percentage < 100) {
    log('📝 Next Steps:', 'yellow');
    
    if (!fs.existsSync('backend/node_modules')) {
      log('   1. Install backend dependencies: cd backend && npm install', 'yellow');
    }
    
    if (!fs.existsSync('frontend/node_modules')) {
      log('   2. Install frontend dependencies: cd frontend && npm install', 'yellow');
    }
    
    if (!fs.existsSync('backend/.env')) {
      log('   3. Configure backend: cp backend/.env.example backend/.env', 'yellow');
    }
    
    if (!fs.existsSync('frontend/.env')) {
      log('   4. Configure frontend: cp frontend/.env.example frontend/.env', 'yellow');
    }
    
    log('\n   See GETTING_STARTED.md for detailed instructions\n', 'cyan');
  } else {
    log('🚀 Ready to Start!', 'green');
    log('\n   Run: docker-compose up -d', 'cyan');
    log('   Or: npm run dev\n', 'cyan');
    log('   Then open: http://localhost:5173\n', 'cyan');
  }

  process.exit(percentage === 100 ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
