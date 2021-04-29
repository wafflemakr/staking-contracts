const MasterChef = artifacts.require("MasterChef");
const SushiToken = artifacts.require("SushiToken");
const LPToken = artifacts.require("LPToken");

const { BN, time } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
require("chai").use(require("chai-bn")(BN));

contract("Master Chef", ([owner, dev, alice, bob, random]) => {
  let masterChef, sushi, lp;

  before(async function () {
    sushi = await SushiToken.new();
    lp = await LPToken.new();

    /**
        SushiToken _sushi,
        address _devaddr,
        uint256 _sushiPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
     */
    masterChef = await MasterChef.new(sushi.address, dev, "100", "10", "100");

    await sushi.transferOwnership(masterChef.address, { from: owner });

    await lp.mint(alice, "1000", { from: owner });
    await lp.mint(bob, "1000", { from: owner });
  });

  it("should add a new pool", async function () {
    await masterChef.add("100", lp.address, true);
  });

  it("should be able to stake LP tokens", async function () {
    await lp.approve(masterChef.address, "100", { from: alice });
    await masterChef.deposit(0, "100", { from: alice }); // pid 0
  });

  it("should be able to claim sushi rewards", async function () {
    await time.advanceBlockTo(15);
    await masterChef.deposit(0, "0", { from: alice }); // block 16

    expect(await sushi.balanceOf(alice)).to.be.bignumber.equal("6000");
  });
});
