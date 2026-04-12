import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying MultiSend v1.1.0...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const gasOverrides: Record<string, bigint> = {};
  if (process.env.GAS_PRICE_GWEI) {
    gasOverrides.gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI, "gwei");
    console.log(`⛽ Gas price override: ${process.env.GAS_PRICE_GWEI} gwei`);
  }

  const MultiSend = await ethers.getContractFactory("MultiSend");
  const multiSend = await MultiSend.deploy(gasOverrides);

  await multiSend.waitForDeployment();

  const address = await multiSend.getAddress();
  console.log("MultiSend deployed to:", address);

  console.log("\nNext steps:");
  console.log(`1. Update MULTISEND_ADDRESS=${address} in .env`);
  console.log("2. Start the skill server with 'npm run dev'");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
