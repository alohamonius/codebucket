//SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

library LibV1 {
    function innerLogic(uint256 value) internal pure returns (uint256) {
        return value * 10;
    }
}
