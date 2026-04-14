import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Multi-Send Skill Bootstrap...');

function run(cmd) {
  console.log(`\n> Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
}

// 1. Install dependencies
if (!fs.existsSync('node_modules')) {
  run('npm install');
}

// 2. Compile contracts
run('npm run compile');

// 3. Deployment check
const configPath = path.join(process.cwd(), 'skill', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!config.MULTISEND_ADDRESS) {
  console.log('\n📝 MULTISEND_ADDRESS not found in config. Attempting deployment...');
  
  // Check for .env or environment variables
  if (!process.env.PRIVATE_KEY && !fs.existsSync('.env')) {
    console.error('❌ ERROR: Missing PRIVATE_KEY. Please provide it in .env before deployment.');
    process.exit(1);
  }
  
  run('npm run deploy');
} else {
  console.log(`\n✅ Contract already deployed at: ${config.MULTISEND_ADDRESS}`);
}

// 4. Test
run('npm run test');

console.log('\n✨ Setup Complete! You can now start the server with: npm run dev');
