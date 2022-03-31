// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../utils/DSMath.sol";

contract Staking is Ownable {
    using DSMath for uint256;

    IERC20 public stakingToken;

    uint256 public totalStaked;
    uint128 _rewardPerTokenSum;

    struct StakerInfo {
        uint128 stakedAmount;
        uint128 rewardPerTokenSumSnapshot;
    }

    mapping(address => StakerInfo) _stakersInfo;

    constructor(IERC20 _stakingToken) {
        stakingToken = _stakingToken;
    }

    function stake(uint128 amount) public {
        _stakersInfo[msg.sender] = StakerInfo(amount, _rewardPerTokenSum);
        totalStaked += amount;

        stakingToken.transferFrom(msg.sender, address(this), amount);
    }

    function distribute(uint256 _reward) public onlyOwner {
        require(totalStaked > 0, "Staking: No tokens staked");

        // Factored out summation needed for calculating rewards in O(1)
        uint256 rewardPerToken = _reward.wdiv(totalStaked);
        _rewardPerTokenSum = _rewardPerTokenSum + uint128(rewardPerToken);
    }

    function unstake(uint128 amount) public {
        StakerInfo memory stakerInfo = _stakersInfo[msg.sender];

        require(
            amount <= stakerInfo.stakedAmount,
            "Staking: Not enough tokens"
        );

        uint256 accountReward = _calculateReward(stakerInfo);
        stakerInfo.rewardPerTokenSumSnapshot = _rewardPerTokenSum;

        uint256 stakedAmount = stakerInfo.stakedAmount;

        stakerInfo.stakedAmount -= amount;
        totalStaked -= stakedAmount;

        _stakersInfo[msg.sender] = stakerInfo;

        // Could use safeTransfer, but since it's own our token we know that
        // a revert will trigger if any check fails (other tokens could just return false
        // without reverting)
        stakingToken.transfer(msg.sender, amount);
        stakingToken.mint(msg.sender, accountReward);
    }

    function reward() public view returns (uint256) {
        StakerInfo memory stakerInfo = _stakersInfo[msg.sender];
        return _calculateReward(stakerInfo);
    }

    function staked(address account) public view returns (uint256) {
        return _stakersInfo[account].stakedAmount;
    }

    function _calculateReward(StakerInfo memory stakerInfo)
        internal
        view
        returns (uint256)
    {
        return
            (stakerInfo.stakedAmount *
                (_rewardPerTokenSum - stakerInfo.rewardPerTokenSumSnapshot)) /
            DSMath.WAD;
    }
}

interface IERC20 {
    function transfer(address account, uint256 amount) external;

    function mint(address account, uint256 amount) external;

    function transferFrom(
        address account,
        address spender,
        uint256 amount
    ) external;
}
