module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer, dev } = await getNamedAccounts();

  const sushi = await get("SushiToken");

  const { receipt } = await deploy("MasterChef", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
    args: [
      /**
        SushiToken _sushi,
        address _devaddr,
        uint256 _sushiPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
     */
      sushi.address,
      dev,
      "100",
      "10",
      "100",
    ],
  });

  log(`Gas Used: ${receipt.gasUsed}`);
};

module.exports.tags = ["MasterChef"];
module.exports.dependencies = ["SushiToken"];
