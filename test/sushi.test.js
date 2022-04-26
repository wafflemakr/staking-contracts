const { expect } = require("chai");
const {
  ethers,
  deployments: { fixture },
} = require("hardhat");

const increaseBlocks = async (amount) => {
  while (amount > 0) {
    await ethers.provider.send("evm_mine");
    amount--;
  }
};

describe("Master Chef", () => {
  before(async function () {
    [ownerSigner, aliceSigner, bobSigner] = await ethers.getSigners();
    alice = aliceSigner.address;
    bob = bobSigner.address;

    await fixture(["MasterChef", "LPToken"]);

    sushi = await ethers.getContract("SushiToken");
    lp = await ethers.getContract("LPToken");
    masterChef = await ethers.getContract("MasterChef");

    await sushi.transferOwnership(masterChef.address);

    await lp.mint(alice, "1000");
    await lp.mint(bob, "1000");
  });

  it("should add a new pool", async function () {
    await masterChef.add("100", lp.address, true);
  });

  it("should be able to stake LP tokens", async function () {
    await lp.connect(aliceSigner).approve(masterChef.address, "100");
    await masterChef.connect(aliceSigner).deposit(0, "100"); // pid 0
  });

  it("should be able to claim sushi rewards", async function () {
    await increaseBlocks(5);

    await masterChef.connect(aliceSigner).deposit(0, "0"); // block 16

    expect(Number(await sushi.balanceOf(alice))).to.be.greaterThan(0);
  });
});
