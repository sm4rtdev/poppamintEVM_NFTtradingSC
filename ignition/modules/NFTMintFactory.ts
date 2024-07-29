import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTMint = buildModule("NFTMint", (m) => {
  const NFTmint = m.contract("NFTMintFactory");

  return { NFTmint };
});

export default NFTMint;
