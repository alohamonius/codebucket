// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

error TokenMinter__LowValue();
error TokenMinter__AmountLimit();

/**
 * @title ERC721 collection contract
 * @author alohamonius
 * @notice Demo of nft collection
 * @dev With refund mechanism
 */
contract TokenMinter is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    struct SaleConfig {
        uint256 saleTime;
        uint256 mintRate;
        uint32 maximumPerAccount;
        bool paused;
        string baseURI;
    }

    Counters.Counter private _tokenIdCounter;
    mapping(address => uint32) private _addressData;
    SaleConfig public saleConfig;

    string private baseExtension = ".json";
    string private fakeUri = "";
    string private realUri = "";
    bool private revealed = false;
    bool private onlyWhitelisted = false;

    uint256 public constant MAX_SUPPLY = 50;

    event Minted(address owner, uint256 tokenId);

    constructor(
        uint256 saleTime,
        uint128 mintRate,
        uint32 perUser
    ) ERC721("BOUIIU", "ALT") {
        saleConfig = SaleConfig(saleTime, mintRate, perUser, false, "");
    }

    function mint(uint32 amount) external payable {
        uint256 _saleStartTime = uint256(saleConfig.saleTime);

        require(
            _saleStartTime != 0 && block.timestamp >= _saleStartTime,
            "Sale has not started yet"
        );
        require(totalSupply() < MAX_SUPPLY, "Limit reached");
        require(totalSupply() + amount <= MAX_SUPPLY, "Limit reached");
        if (msg.value < saleConfig.mintRate * amount) {
            revert TokenMinter__LowValue();
        }
        if (amount > saleConfig.maximumPerAccount) {
            revert TokenMinter__AmountLimit();
        }
        if (
            _addressData[msg.sender] > saleConfig.maximumPerAccount ||
            _addressData[msg.sender] + amount > saleConfig.maximumPerAccount
        ) {
            revert TokenMinter__AmountLimit();
        }

        for (uint128 i = 1; i <= amount; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId);
            _addressData[msg.sender] = ++_addressData[msg.sender];
        }

        refundIfOver(saleConfig.mintRate * amount);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (revealed == false) return fakeUri;

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        Strings.toString(tokenId),
                        baseExtension
                    )
                )
                : "";
    }

    function setStartTime(uint32 saleTime) external onlyOwner {
        saleConfig.saleTime = saleTime;
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    function getSalesData() public view returns (SaleConfig memory) {
        return saleConfig;
    }

    function reveal() public onlyOwner {
        revealed = true;
    }

    function setPause(bool _state) public onlyOwner {
        saleConfig.paused = _state;
    }

    function setMintRate(uint256 _rate) public onlyOwner {
        saleConfig.mintRate = _rate;
    }

    function setOnlyWhitelisted(bool _state) public onlyOwner {
        onlyWhitelisted = _state;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        realUri = _newBaseURI;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        fakeUri = _notRevealedURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return realUri;
    }

    function refundIfOver(uint256 price) private {
        require(msg.value >= price, "Need to send more ETH.");
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
}
