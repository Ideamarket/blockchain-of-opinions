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
	let URI = "data:application/json;base64," + Buffer.from('{"name": "Ideamarket Posts","description": "Ideamarket Post that tracks public opinion without trusted third parties — a collectible belief!","image": "https://ibb.co/5Y8nQhJ","external_link": "https://ideamarket.io/", "seller_fee_basis_points": 500, "fee_recipient": "0x1Cc33A0ae55C250F66B8f9A1a3094bF285A9083f"}').toString("base64")
	const OpinionBase = await ethers.getContractFactory("CitationMultiAction");
	const opinionBase = await OpinionBase.deploy("0x1EAb68548F5ca15D874166522BBa6B724b03A534", "0x5d4D7bB3e572fCFF64D2286e36342c0eA7B270Df", { gasLimit: ethers.BigNumber.from(200000000)});
	await opinionBase.deployed();

	console.log(`[$]: npx hardhat verify --network <> ${opinionBase.address}`);

}

// We recommend this pattern to be able to use async/await everywhere 
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});