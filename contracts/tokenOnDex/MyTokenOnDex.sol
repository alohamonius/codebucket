// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyTokenOnDex is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        require(
            recipient != address(0),
            "ERC20: transfer to the zero address is not allowed"
        );
        require(amount > 0, "ERC20: transfer amount must be greater than zero");

        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        require(
            sender != address(0),
            "ERC20: transfer from the zero address is not allowed"
        );
        require(
            recipient != address(0),
            "ERC20: transfer to the zero address is not allowed"
        );
        require(amount > 0, "ERC20: transfer amount must be greater than zero");

        _transfer(sender, recipient, amount);

        uint256 currentAllowance = allowance(sender, _msgSender());
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        _approve(sender, _msgSender(), currentAllowance - amount);

        return true;
    }
}
