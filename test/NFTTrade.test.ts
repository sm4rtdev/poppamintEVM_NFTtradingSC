import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractFactory, Signer } from "ethers";
import { NFTMintFactory, NFTTrade } from "../typechain";

describe("NFTMintFactory and NFTTrade", function () {
  let NFTMintFactory: ContractFactory;
  let NFTTrade: ContractFactory;
  let nftMintFactory: NFTMintFactory;
  let nftTrade: NFTTrade;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let unlockTime: number;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Get the current block timestamp and set unlock time to 1 hour from now
    unlockTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;

    // Deploy the NFTMintFactory contract
    NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    nftMintFactory = (await NFTMintFactory.deploy(
      "NFTMintFactory",
      "NFTMF",
      unlockTime,
      { value: ethers.utils.parseEther("1.0") }
    )) as NFTMintFactory;
    await nftMintFactory.deployed();

    // Deploy the NFTTrade contract
    NFTTrade = await ethers.getContractFactory("NFTTrade");
    nftTrade = (await NFTTrade.deploy(nftMintFactory.address)) as NFTTrade;
    await nftTrade.deployed();
  });

  it("Should deploy NFTMintFactory and NFTTrade with correct parameters", async function () {
    expect(await nftMintFactory.unlockTime()).to.equal(unlockTime);
    expect(await nftMintFactory.owner()).to.equal(await owner.getAddress());
  });

  it("Should mint an NFT", async function () {
    const tokenURI = "https://example.com/nft";
    await expect(nftMintFactory.mintNFT(await addr1.getAddress(), tokenURI))
      .to.emit(nftMintFactory, "NFTMinted")
      .withArgs(await addr1.getAddress(), 1, tokenURI);

    expect(await nftMintFactory.tokenCounter()).to.equal(1);
    expect(await nftMintFactory.ownerOf(1)).to.equal(await addr1.getAddress());
    expect(await nftMintFactory.tokenURI(1)).to.equal(tokenURI);
  });

  it("Should list an NFT for sale and buy it", async function () {
    const tokenURI = "https://example.com/nft";
    await nftMintFactory.mintNFT(await addr1.getAddress(), tokenURI);
    await nftMintFactory.connect(addr1).approve(nftTrade.address, 1);

    const price = ethers.utils.parseEther("1.0");
    await expect(nftTrade.connect(addr1).listNFT(1, price))
      .to.emit(nftTrade, "NFTListed")
      .withArgs(1, price, await addr1.getAddress());

    await expect(nftTrade.connect(addr2).buyNFT(1, { value: price }))
      .to.emit(nftTrade, "NFTBought")
      .withArgs(1, price, await addr2.getAddress(), await addr1.getAddress());

    expect(await nftMintFactory.ownerOf(1)).to.equal(await addr2.getAddress());
  });

  it("Should allow withdrawal after unlock time", async function () {
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);

    const initialBalance = await ethers.provider.getBalance(
      await owner.getAddress()
    );
    await expect(nftMintFactory.withdraw())
      .to.emit(nftMintFactory, "Withdrawal")
      .withArgs(ethers.utils.parseEther("1.0"), anyValue);

    const finalBalance = await ethers.provider.getBalance(
      await owner.getAddress()
    );
    expect(finalBalance.sub(initialBalance)).to.be.closeTo(
      ethers.utils.parseEther("1.0"),
      ethers.utils.parseEther("0.01")
    ); // account for gas fees
  });

  it("Should not allow withdrawal before unlock time", async function () {
    await expect(nftMintFactory.withdraw()).to.be.revertedWith(
      "You can't withdraw yet"
    );
  });
});
