#!/usr/bin/env node
/**
 * Automated Setup Script
 * Handles: Database creation, application startup, and GitHub push
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50) + '\n');
}

async function checkPostgreSQL() {
  log('Checking PostgreSQL installation...', 'yellow');
  
  return new Promise((resolve) => {
    const check = spawnSync('psql', ['--version'], { encoding: 'utf-8' });
    
    if (check.status === 0) {
      log('✓ PostgreSQL found:', 'green');
      log('  ' + check.stdout.trim(), 'green');
      resolve(true);
    } else {
      log('✗ PostgreSQL not found', 'red');
      resolve(false);
    }
  });
}

async function createDatabase(dbName = 'csv_converter', dbUser = 'postgres', dbHost = 'localhost') {
  log(`Creating database "${dbName}"...`, 'yellow');
  
  return new Promise((resolve) => {
    const proc = spawnSync('createdb', ['-U', dbUser, '-h', dbHost, dbName], { encoding: 'utf-8' });
    
    if (proc.status === 0) {
      log(`✓ Database "${dbName}" created successfully`, 'green');
      resolve(true);
    } else if (proc.stderr.includes('already exists')) {
      log(`✓ Database "${dbName}" already exists`, 'green');
      resolve(true);
    } else {
      log(`✗ Failed to create database:`, 'red');
      log('  ' + (proc.stderr || proc.stdout), 'red');
      resolve(false);
    }
  });
}

async function startServer() {
  logSection('Starting Node.js Server');
  
  return new Promise((resolve) => {
    log('Starting server with "npm start"...', 'yellow');
    
    const proc = spawn('npm', ['start'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('exit', (code) => {
      if (code === 0) {
        log('✓ Server started successfully', 'green');
      } else {
        log(`✗ Server exited with code ${code}`, 'red');
      }
      resolve(code === 0);
    });
  });
}

async function initializeGit(repoUrl) {
  logSection('Setting up Git Repository');
  
  try {
    // Check if already a git repo
    const isGitRepo = fs.existsSync(path.join(process.cwd(), '.git'));
    
    if (!isGitRepo) {
      log('Initializing git repository...', 'yellow');
      spawnSync('git', ['init'], { stdio: 'inherit' });
    } else {
      log('✓ Git repository already initialized', 'green');
    }
    
    // Add all files
    log('Adding files to git...', 'yellow');
    spawnSync('git', ['add', '.'], { stdio: 'inherit' });
    
    // Commit
    log('Creating commit...', 'yellow');
    spawnSync('git', ['commit', '-m', 'Initial commit: CSV to JSON converter API with PostgreSQL'], { stdio: 'inherit' });
    
    // Check if remote exists
    const remoteCheck = spawnSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf-8' });
    
    if (repoUrl && !remoteCheck.stdout.trim()) {
      log('Adding GitHub remote...', 'yellow');
      spawnSync('git', ['remote', 'add', 'origin', repoUrl], { stdio: 'inherit' });
    } else if (repoUrl) {
      log('Updating GitHub remote...', 'yellow');
      spawnSync('git', ['remote', 'set-url', 'origin', repoUrl], { stdio: 'inherit' });
    }
    
    // Set main branch
    log('Setting main branch...', 'yellow');
    spawnSync('git', ['branch', '-M', 'main'], { stdio: 'inherit' });
    
    // Push to GitHub
    if (repoUrl) {
      log('Pushing to GitHub...', 'yellow');
      const pushProc = spawnSync('git', ['push', '-u', 'origin', 'main'], { encoding: 'utf-8' });
      
      if (pushProc.status === 0) {
        log('✓ Successfully pushed to GitHub', 'green');
      } else {
        log('⚠ Push to GitHub may require authentication', 'yellow');
        log('  You may need to enter credentials or use SSH keys', 'yellow');
        log('  Error: ' + (pushProc.stderr || 'Unknown error'), 'yellow');
      }
    }
    
    return true;
  } catch (error) {
    log('✗ Git operations failed: ' + error.message, 'red');
    return false;
  }
}

async function main() {
  logSection('CSV to JSON Converter - Automated Setup');
  
  // Check PostgreSQL
  const hasPostgreSQL = await checkPostgreSQL();
  
  if (!hasPostgreSQL) {
    log('\n⚠ PostgreSQL is not installed!', 'red');
    log('\nPlease install PostgreSQL from: https://www.postgresql.org/download/windows/', 'yellow');
    log('Then run this script again.', 'yellow');
    rl.close();
    process.exit(1);
  }
  
  // Create database
  logSection('Database Setup');
  const dbCreated = await createDatabase();
  
  if (!dbCreated) {
    log('\n⚠ Could not create database. Continuing with server startup...', 'yellow');
  }
  
  // Ask about GitHub
  logSection('GitHub Configuration');
  const setupGit = await question('Do you want to set up Git and push to GitHub? (y/n): ');
  
  let repoUrl = null;
  if (setupGit.toLowerCase() === 'y') {
    repoUrl = await question('Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): ');
  }
  
  // Ask about starting server
  const startNow = await question('\nDo you want to start the server now? (y/n): ');
  
  if (startNow.toLowerCase() === 'y') {
    await startServer();
  }
  
  if (repoUrl) {
    await initializeGit(repoUrl);
  }
  
  logSection('Setup Complete!');
  log('✓ All steps completed', 'green');
  log('\nTo start the server in the future, run:', 'cyan');
  log('  npm start', 'bold');
  log('\nTo run tests:', 'cyan');
  log('  npm test', 'bold');
  
  rl.close();
}

main().catch(error => {
  log('Setup failed: ' + error.message, 'red');
  rl.close();
  process.exit(1);
});
