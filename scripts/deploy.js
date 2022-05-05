// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require('hardhat')

async function main() {
	// Hardhat always runs the compile task when running scripts with its command
	// line interface.
	//
	// If this script is run directly using `node` you may want to call compile
	// manually to make sure everything is compiled
	// await hre.run('compile');

	// We get the contract to deploy
	const OpinionBase = await ethers.getContractFactory("IdeamarketPosts");
	const opinionBase = await OpinionBase.deploy('0x1Cc33A0ae55C250F66B8f9A1a3094bF285A9083f', { gasLimit: ethers.BigNumber.from(200000000)});

	await opinionBase.deployed();

	console.log(`[$]: npx hardhat verify --network <> ${opinionBase.address}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
