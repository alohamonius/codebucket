// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWETH is ERC20 {
    constructor(address to) ERC20("Wrapped ETHER", "WETH") {
        _mint(to, 9999 ether);
    }
}
