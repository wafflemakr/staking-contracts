module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const { receipt } = await deploy('LPToken', {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  log(`Gas Used: ${receipt.gasUsed}`);
};

module.exports.tags = ['LPToken'];
