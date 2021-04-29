const MasterChef = artifacts.require("MasterChef");
const SushiToken = artifacts.require("SushiToken");
const LPToken = artifacts.require("LPToken");

contract("Master Chef", ([owner, dev, alice, bob, random]) => {
  let masterChef, sushi, lp;

  before(async function () {
    sushi = await SushiToken.new();
    lp = await LPToken.new();
    masterChef = await MasterChef.new(sushi.address, dev, "1000", "0", "1000");

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
});
