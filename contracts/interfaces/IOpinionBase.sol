//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IOpinionBase
 * @author Kelton Madden
 */

interface IOpinionBase {
    struct Opinion {
        address author;
        address addy;
        uint8 rating;
        string comment;
        uint timestamp;
    }
    function writeOpinion(address addy, uint8 rating, string calldata comment) external;
    function getOpinion(address addy, address user) external view returns (Opinion[] memory);
    function getUsersOpinions(address user) external view returns (Opinion[] memory);
    function getOpinionsAboutAddress(address addy) external view returns (Opinion[] memory);
    function getOpinedAddresses() external view returns (address[] memory);
    function getAllOpinions() external view returns (Opinion[] memory);
}