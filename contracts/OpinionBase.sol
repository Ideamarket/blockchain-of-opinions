//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IOpinionBase.sol";
contract OpinionBase is IOpinionBase {
    mapping

function writeOpinion(address addy, uint8 rating, string calldata comment) external override {}











function getOpinion(address addy, address user) external override view returns (Opinion[] memory){}
function getUserOpinions(address user) external override view returns (Opinion[] memory);
function getOpinionsOnAddress(address addy) external override view returns (Opinion[] memory);
function getOpinedAddresses() external override view returns (address[] memory);
function getAllOpinions() external override view returns (Opinion[] memory);
function migrateAddress(address[] calldata oldAddress, address[] calldata newAddress) external override;



}