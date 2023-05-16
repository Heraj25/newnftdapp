const hre = require("hardhat");

async function getChainId() {
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log("Chain ID:", chainId);
}

getChainId();
