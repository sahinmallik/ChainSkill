const chainList = artifacts.require("./ChainList.sol");

module.exports = function (deployer) {
  deployer.deploy(chainList);
};
