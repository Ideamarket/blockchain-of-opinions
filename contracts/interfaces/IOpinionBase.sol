//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
    function getUserOpinions(address user) external view returns (Opinion[] memory);
    function getOpinionsOnAddress(address addy) external view returns (Opinion[] memory);
    function getOpinedAddresses() external view returns (address[] memory);
    function getAllOpinions() external view returns (Opinion[] memory);
    function migrateAddress(address[] calldata oldAddress, address[] calldata newAddress) external;

}
