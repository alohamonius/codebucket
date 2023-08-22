// SPDX-License-Identifier: MIT LICENSE
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title ERC20 reward token for Staker app
 * @author alohamonius
 * @notice Simple ERC20 with admins
 */
contract ERC20Rewards is ERC20, Ownable {
    mapping(address => bool) admins;

    constructor() ERC20("AlohaReward", "ALTR") {}

    function mint(address to, uint256 amount) external {
        require(admins[msg.sender], "Only admins");
        _mint(to, amount);
    }

    function addController(address controller) external onlyOwner {
        admins[controller] = true;
    }

    function removeController(address controller) external onlyOwner {
        admins[controller] = false;
    }
}
