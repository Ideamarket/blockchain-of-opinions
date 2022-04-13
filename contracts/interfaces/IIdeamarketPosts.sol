//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IIdeamarketPosts
 * @author Kelton Madden
 */

interface IIdeamarketPosts {
    function addCategories(string[] memory category) external;
    function removeCategories(string[] memory category) external;
    function getUsersPosts(address user) external view returns (uint[] memory);
    function isURL(uint tokenID) external view returns (bool);
}
