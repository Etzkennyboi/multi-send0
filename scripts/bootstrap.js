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
  console.log('📦 Installing dependencies (this may take a minute)...');
  run('npm install');
}

// 2. Initialize .env if missing
if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
  console.log('📝 Creating .env from .env.example...');
  fs.copyFileSync('.env.example', '.env');
}

// 3. Compile contracts
console.log('\n🏗️  Compiling contracts...');
run('npm run compile');

// 4. Deployment check
const configPath = path.join(process.cwd(), 'skill', 'config.json');
let config = { MULTISEND_ADDRESS: "" };
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn('⚠️ Could not read skill/config.json');
}

if (!config.MULTISEND_ADDRESS) {
  console.log('\n📝 MULTISEND_ADDRESS not found in config.');
  
  // Check for .env or environment variables
  if (!process.env.PRIVATE_KEY && !fs.existsSync('.env')) {
    console.warn('⚠️  WARNING: Missing PRIVATE_KEY. Skipping deployment.');
    console.log('👉 To deploy, update the PRIVATE_KEY in your .env file and run: npm run deploy');
  } else {
    try {
      run('npm run deploy');
    } catch (err) {
      console.warn('⚠️  Deployment failed. You may need to fund your account or check your RPC.');
    }
  }
} else {
  console.log(`\n✅ Contract already deployed at: ${config.MULTISEND_ADDRESS}`);
}

// 5. Test
console.log('\n🧪 Running tests...');
try {
  run('npm run test');
} catch (err) {
  console.warn('⚠️  Some tests failed. Check the output above.');
}

console.log('\n✨ Bootstrap process finished! If everything went well, start the server with: npm run dev');
