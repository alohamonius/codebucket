// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Market.sol";
import "hardhat/console.sol";

/**
 * @title ERC721 Storage for Marketplace
 * @author alohamonius
 */
contract MarketItem is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Market private immutable market;

    event Minted(address owner, uint256 tokenId);

    constructor(Market _market) ERC721("SHRDTIM", "SHRDITM") {
        market = _market;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        setApprovalForAll(address(market), true);
        emit Minted(msg.sender, tokenId);
        return tokenId;
    }
}
