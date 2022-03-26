//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOpinionBounties {
    struct Bounty {
        address addy;
        address user;
        address token;
        uint amount;
    }
    function addBountiableToken(address token) external;
    function removeBountiableToken(address token) external;
    function depositBounty(address addy, address user, address token, uint amount) external payable;
    function withdrawBounty(address addy, address user, address token) external;
    function getBountyInfo(address addy, address user, address token) external view returns (Bounty memory);
    function claimBounty(address addy, address user, address token) external; //?
    function getAmountDeposited(address addy, address user, address token) external view returns (uint amount);
    function getBountyAmountPayable(address addy, address user, address token) external view returns (uint amount);
    function getBountiesForUser(address user) external view returns (Bounty[] memory);
    function setBountyFee() external;
    function setFeeDistributorAddress() external;
}