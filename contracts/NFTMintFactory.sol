//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMintFactory is ERC721URIStorage, Ownable {
    uint public unlockTime;
    uint public tokenCounter;

    event Withdrawal(uint amount, uint when);
    event NFTMinted(address to, uint tokenId, string tokenURI);

    constructor(string memory name, string memory symbol, uint _unlockTime) ERC721(name, symbol) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        tokenCounter = 0;
        transferOwnership(msg.sender); // Initialize the owner
    }

    function mintNFT(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        tokenCounter++;
        uint256 newTokenId = tokenCounter;
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(to, newTokenId, tokenURI);
        return newTokenId;
    }

    function withdraw() public onlyOwner {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");

        uint amount = address(this).balance;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");

        emit Withdrawal(amount, block.timestamp);
    }

    receive() external payable {}

    fallback() external payable {}
}