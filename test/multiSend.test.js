import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MultiSend", function () {
  async function deployFixture() {
    const [owner, addr1] = await hre.ethers.getSigners();

    const MultiSend = await hre.ethers.getContractFactory("MultiSend");
    const multiSend = await MultiSend.deploy();

    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Mock Token", "MTK");

    return { multiSend, token, owner, addr1 };
  }

  it("should handle 100 unique recipients", async () => {
    const { multiSend, token, owner } = await loadFixture(deployFixture);
    
    const wallets = Array.from({ length: 100 }, () =>
      hre.ethers.Wallet.createRandom().address
    );
    const amounts = Array(100).fill(hre.ethers.parseEther("1"));
    const totalAmount = hre.ethers.parseEther("100");

    await token.mint(owner.address, totalAmount);
    await token.approve(await multiSend.getAddress(), totalAmount);

    await expect(multiSend.multiSend(await token.getAddress(), wallets, amounts))
      .to.emit(multiSend, "MultiSendExecuted")
      .withArgs(owner.address, await token.getAddress(), totalAmount, 100);

    for (let i = 0; i < 5; i++) { // Sample check some balances
        expect(await token.balanceOf(wallets[i])).to.equal(hre.ethers.parseEther("1"));
    }
  });

  it("should revert if token is an EOA (Bug #02)", async () => {
    const { multiSend, owner, addr1 } = await loadFixture(deployFixture);
    const recipients = [addr1.address, owner.address];
    const amounts = [1n, 1n];

    // Using owner.address as the "token" address (it has no code)
    await expect(multiSend.multiSend(owner.address, recipients, amounts))
      .to.be.revertedWithCustomError(multiSend, "NotAContract");
  });

  it("should revert on empty recipients (Bug #13)", async () => {
    const { multiSend, token } = await loadFixture(deployFixture);
    await expect(multiSend.multiSend(await token.getAddress(), [], []))
      .to.be.revertedWithCustomError(multiSend, "EmptyRecipients");
    
    await expect(multiSend.requiredAllowance([]))
      .to.be.revertedWithCustomError(multiSend, "EmptyRecipients");
  });

  it("should revert on zero amounts or zero addresses", async () => {
    const { multiSend, token, owner, addr1 } = await loadFixture(deployFixture);
    const recipients = [addr1.address, owner.address];
    
    // Test zero amount
    await expect(multiSend.multiSend(await token.getAddress(), recipients, [1n, 0n]))
      .to.be.revertedWithCustomError(multiSend, "ZeroAmount");

    // Test zero address recipient
    await expect(multiSend.multiSend(await token.getAddress(), [addr1.address, hre.ethers.ZeroAddress], [1n, 1n]))
      .to.be.revertedWithCustomError(multiSend, "ZeroAddress");

    // Test zero address token
    await expect(multiSend.multiSend(hre.ethers.ZeroAddress, recipients, [1n, 1n]))
      .to.be.revertedWithCustomError(multiSend, "ZeroAddress");
  });

  it("should revert if total amount overflows due to checked math in Pass 1", async () => {
    const { multiSend, token, owner, addr1 } = await loadFixture(deployFixture);
    const recipients = [addr1.address, owner.address];
    const maxUint256 = hre.ethers.MaxUint256;
    
    // maxUint256 + 1n will overflow naturally in JS but we send two large numbers
    await expect(multiSend.multiSend(await token.getAddress(), recipients, [maxUint256, 1n]))
      // Should revert without specific custom error if standard solididy 0.8 checked panic happens
      .to.be.reverted;
  });
});
