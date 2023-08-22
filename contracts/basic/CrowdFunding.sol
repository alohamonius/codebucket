// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "./PriceConverter.sol";

error CrowdFunding__NotOwner();

/**
 * @title Crowd funding
 * @author alohamonius
 * @dev With chainlink oracle for USD calculation
 */
contract CrowdFunding {
    using PriceConverter for uint256;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToValue;
    AggregatorV3Interface private s_priceFeed;

    uint256 public constant MINIMUM_USD = 5 * 10 ** 18;
    address private immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert CrowdFunding__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice Function for funding this contract
     *
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Not enough"
        );
        s_funders.push(msg.sender);
        s_addressToValue[msg.sender] += msg.value;
    }

    /**
     * @notice Function for withdraw money, only owner
     *
     */
    function withdraw() external payable onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            s_addressToValue[s_funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    /**
     * @notice The same as withdraw, but with gas optimization
     *
     */
    function cheaperWithdraw() external payable onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            s_addressToValue[funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 i) external view returns (address) {
        return s_funders[i];
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) external view returns (uint256) {
        return s_addressToValue[fundingAddress];
    }

    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
