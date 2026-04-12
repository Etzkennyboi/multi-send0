import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { MultiSend, MockERC20 } from "../typechain-types";

describe("MultiSend", function () {
  async function deployFixture() {
    const [owner, addr1] = await ethers.getSigners();

    const MultiSend = await ethers.getContractFactory("MultiSend");
    const multiSend = await MultiSend.deploy();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Mock Token", "MTK");

    return { multiSend, token, owner, addr1 };
  }

  it("should handle 100 unique recipients", async () => {
    const { multiSend, token, owner } = await loadFixture(deployFixture);
    
    const wallets = Array.from({ length: 100 }, () =>
      ethers.Wallet.createRandom().address
    );
    const amounts = Array(100).fill(ethers.parseEther("1"));
    const totalAmount = ethers.parseEther("100");

    await token.mint(owner.address, totalAmount);
    await token.approve(await multiSend.getAddress(), totalAmount);

    await expect(multiSend.multiSend(await token.getAddress(), wallets, amounts))
      .to.emit(multiSend, "MultiSendExecuted")
      .withArgs(owner.address, await token.getAddress(), totalAmount, 100);

    for (let i = 0; i < 5; i++) { // Sample check some balances
        expect(await token.balanceOf(wallets[i])).to.equal(ethers.parseEther("1"));
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
});
