const { expect } = require("chai");
const {
  ethers,
  deployments: { fixture },
  getChainId,
} = require("hardhat");
const { signERC2612Permit } = require("eth-permit");

const toWei = (value) => ethers.utils.parseEther(String(value));
const fromWei = (value) => ethers.utils.formatEther(String(value));
const toDays = (amt) => 60 * 60 * 24 * amt;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const increaseTime = async (sec) => {
  await ethers.provider.send("evm_increaseTime", [sec]);
  await ethers.provider.send("evm_mine");
};

describe("Synthetix", () => {
  before(async function () {
    [ownerSigner, aliceSigner, bobSigner] = await ethers.getSigners();

    alice = aliceSigner.address;
    bob = bobSigner.address;

    await fixture(["StakingRewardsFactory", "LPToken"]);
    rewards = await ethers.getContract("RewardsToken");
    lp = await ethers.getContract("LPToken");
    factory = await ethers.getContract("StakingRewardsFactory");

    await lp.mint(alice, toWei(1000));
    await lp.mint(bob, toWei(1000));
  });

  it("should deploy a new pool", async function () {
    await factory.deploy(lp.address, toWei(100), toDays(10));

    const { stakingRewards } = await factory.stakingRewardsInfoByStakingToken(
      lp.address
    );

    stakingContract = await ethers.getContractAt(
      "StakingRewards",
      stakingRewards
    );

    expect(stakingRewards).to.be.not.equal(ZERO_ADDRESS);
  });

  it("should initialize staking pool", async function () {
    await rewards.mint(factory.address, toWei(100));
    await increaseTime(100);

    const { timestamp } = await ethers.provider.getBlock();

    await expect(factory.connect(bobSigner).notifyRewardAmounts())
      .to.emit(stakingContract, "RewardAdded")
      .withArgs(toWei(100), +timestamp + toDays(10) + 1);

    const { stakingRewards } = await factory.stakingRewardsInfoByStakingToken(
      lp.address
    );

    expect(await rewards.balanceOf(stakingRewards)).to.be.equal(toWei(100));

    expect(await rewards.balanceOf(factory.address)).to.be.equal("0");
  });

  it("should stake lp tokens in the pool (alice)", async function () {
    await lp
      .connect(aliceSigner)
      .approve(stakingContract.address, toWei(100), { from: alice });

    await expect(stakingContract.connect(aliceSigner).stake(toWei(100)))
      .to.emit(stakingContract, "Staked")
      .withArgs(alice, toWei(100));
  });

  it("should stake lp tokens in the pool (bob) using permit", async function () {
    const { timestamp } = await ethers.provider.getBlock();
    const deadline = Number(timestamp) + 360;
    chainId = await getChainId();

    const domain = {
      name: "Uniswap V2",
      version: "1",
      chainId,
      verifyingContract: lp.address,
    };

    const values = {
      owner: bob,
      spender: stakingContract.address,
      value: toWei(500),
      nonce: 0,
      deadline,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const res = await bobSigner._signTypedData(domain, types, values);
    const signature = res.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);

    console.log(r, s, v);

    await expect(
      stakingContract
        .connect(bobSigner)
        .stakeWithPermit(toWei(500), deadline, v, r, s)
    )
      .to.emit(stakingContract, "Staked")
      .withArgs(bob, toWei(500));
  });

  it("should stake lp tokens in the pool (bob) using eth-permit", async function () {
    const { timestamp } = await ethers.provider.getBlock();
    const deadline = Number(timestamp) + 360;

    let data = await signERC2612Permit(
      bobSigner,
      lp.address,
      bob,
      stakingContract.address,
      toWei("500"),
      deadline,
      0
    );

    console.log(data.r, data.s, data.v);

    await expect(
      stakingContract
        .connect(bobSigner)
        .stakeWithPermit(toWei(500), deadline, data.v, data.r, data.s)
    )
      .to.emit(stakingContract, "Staked")
      .withArgs(bob, toWei(500));
  });

  it("should claim rewards from the pool", async function () {
    await increaseTime(toDays(8));

    await expect(stakingContract.connect(aliceSigner).getReward()).to.emit(
      stakingContract,
      "RewardPaid"
    );

    expect(Number(await rewards.balanceOf(alice))).to.be.greaterThan(0);
  });
});
