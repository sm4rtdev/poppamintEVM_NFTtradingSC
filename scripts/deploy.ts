import { ethers } from "hardhat";

async function main() {
  // Get the contract factory for NFTMintFactory
  const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");

  // Define deployment parameters
  const name = "NFTMintFactory";
  const symbol = "NFTMF";
  const unlockTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  // Deploy the NFTMintFactory contract
  const nftMintFactory = await NFTMintFactory.deploy(name, symbol, unlockTime, {
    value: ethers.utils.parseEther("1.0"),
  });
  await nftMintFactory.deployed();

  console.log(`NFTMintFactory deployed to: ${nftMintFactory.address}`);

  // Get the contract factory for NFTTrade
  const NFTTrade = await ethers.getContractFactory("NFTTrade");

  // Deploy the NFTTrade contract
  const nftTrade = await NFTTrade.deploy(nftMintFactory.address);
  await nftTrade.deployed();

  console.log(`NFTTrade deployed to: ${nftTrade.address}`);
}

// Execute the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
