module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const { timestamp } = await ethers.provider.getBlock();

  const genesis = Number(timestamp) + 10;

  const rewards = await get("RewardsToken");

  const { receipt } = await deploy('StakingRewardsFactory', {
    from: deployer,
    log: true,
    args:[rewards.address, genesis],
    skipIfAlreadyDeployed: true,
  });

  log(`Gas Used: ${receipt.gasUsed}`);
};

module.exports.tags = ['StakingRewardsFactory'];
module.exports.dependencies = ['RewardsToken'];
