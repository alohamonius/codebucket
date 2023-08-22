// SPDX-License-Identifier: MIT LICENSE
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./LibV2.sol";

/**
 * @title ERC20 reward token for Staker app
 * @author alohamonius
 * @notice Simple ERC20 with admins
 */
contract ProxyTestV2 {
    using LibV2 for uint256;
    uint256 lastSquare;
    mapping(uint256 => uint256) radiusToValue;
    event Calculated(uint256 value);

    function square(uint256 radius) external returns (uint256) {
        require(radius > 0, "radius should be > 0");
        uint256 value = radiusToValue[radius];
        if (value != 0) return value;
        else {
            value = radius.innerLogic();
            radiusToValue[radius] = value;
            lastSquare = value;
            emit Calculated(value);
        }
        return value;
    }

    function getLastCalculatedSquare() external view returns (uint256) {
        return lastSquare;
    }
}
