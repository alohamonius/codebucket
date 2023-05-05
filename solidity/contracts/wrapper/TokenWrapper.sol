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

contract TokenWrapper is ERC721, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    struct TokenData {
        address tokenAddress;
        uint256 amount;
    }

    mapping(uint256 => TokenData[]) private _wrappedTokens;
    mapping(address => bool) private _allowedTokens;


    Counters.Counter private _tokenIdCounter;
    uint256[] private _allTokens;
    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 5;
    address public constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public constant USDC_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    IUniswapV2Router02 private uniswapRouter;

    event TokensAdded(address[] tokens);
    event TokensRemoved(address[] tokens);
    event NFTMinted(address indexed owner, uint256 indexed tokenId, TokenData[] tokens);
    event NFTBurned(address indexed owner, uint256 indexed tokenId);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
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

    function withdraw() external onlyOwner {//reenter
        uint256[] memory tokenIds = getAllTokenIds();
        uint256 sum = 0;

        for(uint256 i=0;i<tokenIds.length;i++){
            uint256 tokenId = tokenIds[i];
            TokenData[] memory tokenData = _wrappedTokens[tokenId];

            for(uint256 j=0;j<tokenData.length;j++){
                address[] memory path = new address[](2);
                IERC20 token = IERC20(tokenData[j].tokenAddress);
                console.log(tokenData[j].tokenAddress,tokenData[j].amount);
                uint256 amount = tokenData[j].amount;
                require(token.approve(address(uniswapRouter), amount),'approve failed');

                path[0]=tokenData[j].tokenAddress;
                path[1]=USDC_ADDRESS;
                console.log('swap',amount);
                uint256[] memory amountsExpected = uniswapRouter.getAmountsOut(
                            amount,//??
                            path
                );

                console.log('amounts',amountsExpected[0],amountsExpected[1]);
                uint256[] memory amounts =
                uniswapRouter.swapExactTokensForTokens(
                    amountsExpected[0],
                    (amountsExpected[1]*500)/1000,//slippage 50%
                    path,
                    address(this),
                    block.timestamp+300);
            }
            delete _wrappedTokens[tokenId];
        }
        IERC20 usdc = IERC20(USDC_ADDRESS);
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(msg.sender, balance), "USDC transfer failed");
    }

    function getAllTokenIds() public view returns (uint256[] memory) {
        return _allTokens;
    }

    function wrap(TokenData[] memory tokens) payable external {
        require(tokens.length > 0 && tokens.length <= 3, "MyNFT: at least one token required");

        for (uint256 i = 0; i < tokens.length; i++) {
            TokenData memory token = tokens[i];
            require(_allowedTokens[token.tokenAddress], "Owner not allow this token");
            require(IERC20(token.tokenAddress).allowance(msg.sender, address(this)) >= token.amount, "MyNFT: Token not approved for transfer");
            require(IERC20(token.tokenAddress).balanceOf(msg.sender) >= token.amount, "MyNFT: Insufficient token balance");
        }

        uint256 tokenId= _tokenIdCounter.current();
        // Transfer the ERC20 tokens to the contract
        for (uint256 i = 0; i < tokens.length; i++) {
            TokenData memory token = tokens[i];
            IERC20 someErc20=IERC20(token.tokenAddress);
            someErc20.transferFrom(msg.sender,address(this), token.amount);
            _wrappedTokens[tokenId].push(token);
        }

        _safeMint(msg.sender, tokenId);
        emit NFTMinted(msg.sender, tokenId, tokens);
        _allTokens.push(tokenId);
        _tokenIdCounter.increment();
    }

    function burn(uint256 tokenId) public {
        TokenData[] storage tokens = _wrappedTokens[tokenId];
        require(tokens.length > 0, "MyNFT: no wrapped tokens");

        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20 token = IERC20(tokens[i].tokenAddress);
            uint256 amount = tokens[i].amount.mul(995).div(1000); // 99.5% of wrapped token amount
            console.log(amount);
            require(token.transfer(msg.sender, amount), "MyNFT: token transfer failed");
            tokens[i].amount = tokens[i].amount.sub(amount);
        }

        _burn(tokenId);
        emit NFTBurned(msg.sender, tokenId);
    }

   
}