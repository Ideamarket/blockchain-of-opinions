//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IIdeamarketPosts
 * @author Kelton Madden
 */

interface IIdeamarketPosts {

    function getUsersPosts(address user) external view returns (uint[] memory);
    function changeFeePrice(uint) external;
    function flipFeeSwitch() external;
    function withdrawOwnerFees() external;
}
