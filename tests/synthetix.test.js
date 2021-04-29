const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");
const StakingRewards = artifacts.require("StakingRewards");
const RewardsToken = artifacts.require("RewardsToken");
const LPToken = artifacts.require("LPToken");

const {
  BN,
  time,
  expectEvent,
  constants: { ZERO_ADDRESS },
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");
require("chai").use(require("chai-bn")(BN));

const toWei = (value) => web3.utils.toWei(String(value));

contract("Synthetix", ([owner, alice, bob, random]) => {
  let rewards, factory, lp, pool;

  before(async function () {
    const genesis = Number(await time.latest()) + 100;
    rewards = await RewardsToken.new();
    lp = await LPToken.new();
    factory = await StakingRewardsFactory.new(rewards.address, genesis);

    await lp.mint(alice, toWei(1000), { from: owner });
    await lp.mint(bob, toWei(1000), { from: owner });
  });

  it("should deploy a new pool", async function () {
    await factory.deploy(lp.address, toWei(100), time.duration.days(10));

    const { stakingRewards } = await factory.stakingRewardsInfoByStakingToken(
      lp.address
    );

    expect(stakingRewards).to.be.not.equal(ZERO_ADDRESS);
  });

  it("should initialize staking pool", async function () {
    await rewards.mint(factory.address, toWei(100));
    await time.increase(100);
    await factory.notifyRewardAmounts({ from: random });
    // expectEvent(tx, "RewardAdded", {
    //   reward: "1000",
    // });

    const { stakingRewards } = await factory.stakingRewardsInfoByStakingToken(
      lp.address
    );

    expect(await rewards.balanceOf(stakingRewards)).to.be.bignumber.equal(
      toWei(100)
    );

    expect(await rewards.balanceOf(factory.address)).to.be.bignumber.equal("0");
  });

  it("should stake lp tokens in the pool (alice)", async function () {
    const { stakingRewards } = await factory.stakingRewardsInfoByStakingToken(
      lp.address
    );

    pool = await StakingRewards.at(stakingRewards);

    await lp.approve(stakingRewards, toWei(100), { from: alice });

    const tx = await pool.stake(toWei(100), { from: alice });

    expectEvent(tx, "Staked", {
      user: alice,
      amount: toWei(100),
    });
  });

  it("should stake lp tokens in the pool (bob)", async function () {
    await lp.approve(pool.address, toWei(500), { from: bob });

    const tx = await pool.stake(toWei(500), { from: bob });

    expectEvent(tx, "Staked", {
      user: bob,
      amount: toWei(500),
    });
  });

  it("should claim rewards from the pool", async function () {
    await time.increase(time.duration.days(8));

    const tx = await pool.getReward({ from: alice });

    expect(await rewards.balanceOf(alice)).to.be.bignumber.not.equal("0");
    expectEvent(tx, "RewardPaid", {
      user: alice,
    });
  });
});
