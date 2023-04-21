// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

error Market__WrongFee();
error Market__AuctionNotStarted(uint256 tokenId);
error Market__AuctionFinished(uint256 tokenId);
error Market__LowBid(uint256 auctionId, uint256 tokenId);
error Market__LowBalanceToBid(uint256 auctionId, uint256 tokenId);

/**
 * @title ERC721 auction storage
 * @author alohamonius
 * @dev	WETH mocks depends on chainID
 */
contract Market is ReentrancyGuard, IERC721Receiver {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    struct Auction {
        uint auctionId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        Bid bestBid;
        uint256 defaultPrice;
        uint256 startOn;
        uint32 duration;
        bool sold;
    }

    struct Bid {
        address owner;
        uint256 value;
    }

    Counters.Counter private _auctionIds;
    Counters.Counter private _itemsSold;
    address payable owner;
    uint256 private immutable listingPrice;
    uint256 private immutable bidStepPercents;
    ERC20 private immutable weth;
    mapping(uint256 => Auction) private auctions;

    event AuctionCreated(
        uint indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        uint256 startOn,
        uint32 duration
    );
    event BidPlaced(address sender, uint256 value, uint256 tokenId);
    event AuctionClaimed(uint256 auctionId);

    modifier onlyWorkingAuction(Auction memory lot) {
        if (block.timestamp < lot.startOn) {
            revert Market__AuctionNotStarted(lot.auctionId);
        }
        if (block.timestamp > lot.startOn.add(lot.duration)) {
            revert Market__AuctionFinished(lot.auctionId);
        }
        _;
    }

    modifier onlyCompletedAuction(Auction memory lot) {
        require(
            block.timestamp > lot.startOn.add(lot.duration),
            "Auction not finished"
        );

        _;
    }

    constructor(ERC20 _weth) {
        owner = payable(msg.sender);
        listingPrice = 0.025 ether;
        bidStepPercents = 2;
        weth = _weth;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function fetchAuction(
        uint256 auctionId
    ) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    function getListingPrice() external view returns (uint256) {
        return listingPrice;
    }

    /* Places an item for sale on the marketplace */
    function auction(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 startOn,
        uint32 duration
    ) external payable nonReentrant {
        if (msg.value != listingPrice) revert Market__WrongFee();
        _auctionIds.increment();

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        uint256 auctionId = _auctionIds.current();

        auctions[auctionId] = Auction(
            auctionId,
            nftContract,
            tokenId,
            payable(msg.sender),
            Bid(address(0), 0),
            price,
            startOn,
            duration,
            false
        );

        emit AuctionCreated(
            auctionId,
            nftContract,
            tokenId,
            msg.sender,
            price,
            startOn,
            duration
        );
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function bid(
        uint256 auctionId
    ) external payable nonReentrant onlyWorkingAuction(auctions[auctionId]) {
        Auction storage lot = auctions[auctionId];

        uint tokenId = lot.tokenId;
        uint256 maxBidPerToken = lot.bestBid.value;
        uint256 minimumBid = getMinimumBid(maxBidPerToken);
        bool isBidInvalid = msg.value < minimumBid &&
            lot.bestBid.owner != address(0);

        if (isBidInvalid) {
            revert Market__LowBid(auctionId, tokenId);
        }
        if (IERC20(weth).balanceOf(msg.sender) < msg.value) {
            revert Market__LowBalanceToBid(auctionId, tokenId);
        }
        uint256 allowance = IERC20(weth).allowance(msg.sender, address(this));
        require(
            allowance >= msg.value,
            "You must first approve the contract to spend your WETH tokens"
        );

        Bid memory newBid = Bid(msg.sender, msg.value);
        lot.bestBid = newBid;
    }

    function claimNFT(
        uint256 auctionId
    ) external payable onlyCompletedAuction(auctions[auctionId]) {
        Auction storage lot = auctions[auctionId];
        require(
            lot.bestBid.owner == msg.sender,
            "You are not the highest bidder"
        );
        require(lot.sold == false, "Auction already sold");

        IERC20(weth).transferFrom(msg.sender, lot.seller, lot.bestBid.value);

        IERC721(auctions[auctionId].nftContract).transferFrom(
            address(this),
            msg.sender,
            lot.tokenId
        );
        lot.sold = true;
        _itemsSold.increment();
        emit AuctionClaimed(auctionId);
    }

    /* Returns all unsold market items */
    function fetchUnsoldAuctions() external view returns (Auction[] memory) {
        uint256 itemCount = _auctionIds.current();
        uint256 unsoldItemCount = _auctionIds.current() - _itemsSold.current();
        if (unsoldItemCount <= 0) {
            return new Auction[](0);
        }

        uint256 currentIndex = 0;
        Auction[] memory items = new Auction[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (!auctions[i].sold) {
                uint currentId = i + 1;
                Auction storage currentItem = auctions[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    /* Returns onlyl items that a user has purchased */
    function fetchMyNFTs() external view returns (Auction[] memory) {
        uint totalItemCount = _auctionIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (auctions[i + 1].bestBid.owner == msg.sender) {
                itemCount += 1;
            }
        }

        Auction[] memory items = new Auction[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (auctions[i + 1].bestBid.owner == msg.sender) {
                uint currentId = i + 1;
                Auction storage currentItem = auctions[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function getMinimumBid(uint256 value) private view returns (uint256) {
        uint256 stepValue = value.div(100).mul(bidStepPercents);
        return value.add(stepValue);
    }
}
