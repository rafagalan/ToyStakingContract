// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import "./ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TKN is ERC20, Ownable {
    constructor() ERC20("TKN", "Best Token", 18) {}

    /// @notice Only the staking contract can call `mint`
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}
