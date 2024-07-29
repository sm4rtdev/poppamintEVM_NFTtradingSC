//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./NFTMintFactory.sol";

contract NFTTrade {
    struct Listing {
        address seller;
        uint256 price;
    }

    NFTMintFactory public nftContract;
    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 tokenId, uint256 price, address seller);
    event NFTBought(uint256 tokenId, uint256 price, address buyer, address seller);

    constructor(address _nftContract) {
        nftContract = NFTMintFactory(_nftContract);
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price
        });

        nftContract.transferFrom(msg.sender, address(this), tokenId);
        emit NFTListed(tokenId, price, msg.sender);
    }

    function buyNFT(uint256 tokenId) public payable {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "NFT not for sale");
        require(msg.value == listing.price, "Incorrect price");

        delete listings[tokenId];

        nftContract.transferFrom(address(this), msg.sender, tokenId);
        (bool success, ) = listing.seller.call{value: msg.value}("");
        require(success, "Failed to send Ether");

        emit NFTBought(tokenId, msg.value, msg.sender, listing.seller);
    }
}