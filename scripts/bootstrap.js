const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// 1. CRITICAL: Install dependencies if missing
if (!fs.existsSync('node_modules')) {
  console.log('📦 node_modules missing. Installing dependencies...');
  run('npm install');
} else {
  console.log('✅ node_modules already present.');
}

// 2. Compile contracts
run('npm run compile');

// 3. Deployment check
const configPath = path.join(process.cwd(), 'skill', 'config.json');
let config = { MULTISEND_ADDRESS: "" };
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

if (!config.MULTISEND_ADDRESS) {
  console.log('\n📝 MULTISEND_ADDRESS not found in config. Attempting deployment...');
  
  // Check for .env or environment variables
  if (!process.env.PRIVATE_KEY && !fs.existsSync('.env')) {
    console.warn('⚠️  WARN: Missing PRIVATE_KEY. Deployment skipped. You must set .env and run npm run deploy manually.');
  } else {
    run('npm run deploy');
  }
} else {
  console.log(`\n✅ Contract already deployed at: ${config.MULTISEND_ADDRESS}`);
}

// 4. Test
run('npm run test');

console.log('\n✨ Setup Complete! You can now start the server with: npm run dev');
