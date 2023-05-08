// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/**
 * @title Wrap many ERC20 to ERC721
 * @author alohamonius
 */
contract TokenWrapper is ERC721, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    struct TokenData {
        address tokenAddress;
        uint256 amount;
    }

    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 5;
    address public constant UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public constant USDC_ADDRESS =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    IUniswapV2Router02 private uniswapRouter;
    mapping(uint256 => TokenData[]) private _wrappedTokens;
    mapping(address => bool) private _allowedTokens;
    Counters.Counter private _tokenIdCounter;
    uint256[] private _allTokens;

    event TokensAdded(address[] tokens);
    event TokensRemoved(address[] tokens);
    event NFTMinted(
        address indexed owner,
        uint256 indexed tokenId,
        TokenData[] tokens
    );
    event NFTBurned(address indexed owner, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function setAllowedTokens(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            _allowedTokens[tokens[i]] = true;
        }
        emit TokensAdded(tokens);
    }

    function removeAllowedTokens(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            _allowedTokens[tokens[i]] = false;
        }
        emit TokensRemoved(tokens);
    }

    function withdraw() external onlyOwner nonReentrant {
        for (uint256 i = 0; i < _allTokens.length; i++) {
            uint256 tokenId = _allTokens[i];
            TokenData[] memory tokenData = _wrappedTokens[tokenId];

            for (uint256 j = 0; j < tokenData.length; j++) {
                address[] memory path = new address[](2);
                IERC20 token = IERC20(tokenData[j].tokenAddress);
                uint256 amount = tokenData[j].amount;
                require(
                    token.approve(address(uniswapRouter), amount),
                    "approve failed"
                );

                path[0] = tokenData[j].tokenAddress;
                path[1] = USDC_ADDRESS;
                uint256[] memory amountsExpected = uniswapRouter.getAmountsOut(
                    amount,
                    path
                );

                uint256[] memory amounts = uniswapRouter
                    .swapExactTokensForTokens(
                        amountsExpected[0],
                        (amountsExpected[1] * 500) / 1000, //slippage 50%
                        path,
                        address(this),
                        block.timestamp + 300
                    );
            }
            delete _wrappedTokens[tokenId];
            removeItem(_allTokens, i);
        }
        IERC20 usdc = IERC20(USDC_ADDRESS);
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(msg.sender, balance), "USDC transfer failed");
    }

    function burn(uint256 tokenId) public {
        TokenData[] storage tokens = _wrappedTokens[tokenId];
        require(tokens.length > 0, "TokenWrapper: no wrapped tokens");
        require(ownerOf(tokenId) == msg.sender, "TokenWrapper: not you nft");

        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20 token = IERC20(tokens[i].tokenAddress);
            uint256 amount = tokens[i].amount.mul(995).div(1000); // 99.5% of wrapped token amount
            console.log(amount);
            require(
                token.transfer(msg.sender, amount),
                "TokenWrapper: token transfer failed"
            );
            tokens[i].amount = tokens[i].amount.sub(amount);
        }

        _burn(tokenId);
        emit NFTBurned(msg.sender, tokenId);
    }

    function wrap(TokenData[] memory tokens) external payable {
        require(
            tokens.length > 0 && tokens.length <= 3,
            "TokenWrapper: at least one token required"
        );

        for (uint256 i = 0; i < tokens.length; i++) {
            TokenData memory token = tokens[i];
            require(
                _allowedTokens[token.tokenAddress],
                "Owner not allow this token"
            );
            require(
                IERC20(token.tokenAddress).allowance(
                    msg.sender,
                    address(this)
                ) >= token.amount,
                "TokenWrapper: Token not approved for transfer"
            );
            require(
                IERC20(token.tokenAddress).balanceOf(msg.sender) >=
                    token.amount,
                "TokenWrapper: Insufficient token balance"
            );
        }

        uint256 tokenId = _tokenIdCounter.current();
        // Transfer the ERC20 tokens to the contract
        for (uint256 i = 0; i < tokens.length; i++) {
            TokenData memory token = tokens[i];
            IERC20 someErc20 = IERC20(token.tokenAddress);
            someErc20.transferFrom(msg.sender, address(this), token.amount);
            _wrappedTokens[tokenId].push(token);
        }

        _safeMint(msg.sender, tokenId);
        emit NFTMinted(msg.sender, tokenId, tokens);
        _allTokens.push(tokenId);
        _tokenIdCounter.increment();
    }

    function removeItem(uint256[] storage array, uint index) internal {
        require(index < array.length);
        array[index] = array[array.length - 1];
        array.pop();
    }
}
