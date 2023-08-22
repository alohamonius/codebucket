// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./ERC20Rewards.sol";
import "./TokenMinter.sol";
import "hardhat/console.sol";

error Staker__NothingToClaim();

/**
 * @title Stake ERC721 and get ERC20 rewards
 * @author alohamonius
 * @notice Demo of staking app
 */
contract Staker is Ownable, IERC721Receiver {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    struct Stake {
        address owner;
        uint256 tokenId;
        uint256 startTime;
    }

    Counters.Counter public totalStaked;
    uint256 public immutable REWARD_PERIOD;
    uint256 public immutable REWARD_PER_PERIOD;
    TokenMinter private immutable nft;
    ERC20Rewards private immutable rewardToken;
    mapping(address => Stake[]) public vault;
    mapping(uint256 => address) public owners;
    mapping(uint256 => Stake) public stakes;

    event Staked(address owner, uint256 tokenId, uint256 value);
    event Withdrawn(address owner, uint256 tokenId, uint256 when);
    event Claimed(address owner, uint256 value);

    constructor(
        TokenMinter _nft,
        ERC20Rewards _token,
        uint256 rewardPeriod,
        uint256 rewardPerDay
    ) {
        nft = _nft;
        rewardToken = _token;
        REWARD_PERIOD = rewardPeriod;
        REWARD_PER_PERIOD = rewardPerDay;
    }

    function getTokenVault(
        uint256 tokenId
    ) external view returns (Stake memory) {
        return stakes[tokenId];
    }

    function getPortfolio(
        address account
    ) external view returns (Stake[] memory) {
        return vault[account];
    }

    function getStakeItemAddress() external view returns (address) {
        return address(nft);
    }

    function getRewardAddress() external view returns (address) {
        return address(rewardToken);
    }

    function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        require(from == address(0x0), "Cannot send nfts to Vault directly");
        return IERC721Receiver.onERC721Received.selector;
    }

    function stake(uint256[] calldata tokenIds) external payable {
        uint256 tokenId;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            require(nft.ownerOf(tokenId) == msg.sender, "Not you token");
            require(owners[tokenId] == address(0), "Already staked");

            nft.transferFrom(msg.sender, address(this), tokenId);
            emit Staked(msg.sender, tokenId, block.timestamp);

            totalStaked.increment();

            Stake memory newStake = Stake({
                tokenId: tokenId,
                startTime: block.timestamp,
                owner: msg.sender
            });
            owners[tokenId] = msg.sender;
            stakes[tokenId] = newStake;
            vault[msg.sender].push(newStake);
        }
    }

    function claim() external payable {
        Stake[] memory userStaked = vault[msg.sender];
        if (userStaked.length == 0) {
            revert Staker__NothingToClaim();
        }

        uint256 tokenId;
        uint256 earned = 0;

        for (uint256 i = 0; i < userStaked.length; i++) {
            tokenId = userStaked[i].tokenId;
            require(owners[tokenId] == msg.sender, "Not you token");
            earned = earned.add(_earning(tokenId));
        }

        if (earned > 0) {
            rewardToken.mint(msg.sender, earned);
            emit Claimed(msg.sender, earned);
        } else {
            revert Staker__NothingToClaim();
        }
    }

    function withdraw(uint256[] calldata tokenIds) external payable {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(owners[tokenId] == msg.sender, "Not exist in vault"); // hah, but tokenid could be 0

            nft.transferFrom(address(this), msg.sender, tokenId);
            emit Withdrawn(msg.sender, tokenId, block.timestamp);
            totalStaked.decrement();

            uint256 index = getStake(vault[msg.sender], tokenId);
            removeStake(msg.sender, index);
            delete owners[tokenId];
            delete stakes[tokenId];
        }
    }

    function _earning(uint256 tokenId) private view returns (uint256) {
        Stake[] storage userStakes = vault[msg.sender];
        uint256 stakeIndex = getStake(userStakes, tokenId);
        require(stakeIndex < userStakes.length, "You have no NFT staked");

        Stake storage tokenIdStake = userStakes[stakeIndex];

        uint256 stakedTime = block.timestamp - tokenIdStake.startTime;
        uint256 stakedReward = 0;

        uint256 periods = stakedTime.div(REWARD_PERIOD);

        if (periods > 0) {
            stakedReward = stakedReward.add(periods.mul(REWARD_PER_PERIOD));
        }
        return stakedReward;
    }

    //todo: library
    function getStake(
        Stake[] storage items,
        uint256 tokenId
    ) private view returns (uint256) {
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].tokenId == tokenId) {
                return i;
            }
        }
        return items.length;
    }

    function removeStake(address staker, uint256 index) private {
        require(index < vault[staker].length, "Index out of bounds");
        if (index != vault[staker].length - 1) {
            vault[staker][index] = vault[staker][vault[staker].length - 1];
        }
        vault[staker].pop();
    }
}
