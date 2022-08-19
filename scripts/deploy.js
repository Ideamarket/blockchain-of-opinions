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
	// We get the contract to deploy
	//const OpinionBase = await ethers.getContractFactory("IdeamarketPosts");
	//const opinionBase = await OpinionBase.deploy('0x93f9707adb26d98cfc6d73C8840425010AfA968B', { gasLimit: ethers.BigNumber.from(200000000)});
	//const opinionBase = await OpinionBase.deploy('0x4e6a11b687F35fA21D92731F9CD2f231C61f9151', { gasLimit: ethers.BigNumber.from(200000000)});
	const OpinionBase = await ethers.getContractFactory("IdeamarketPosts");
	const opinionBase = await OpinionBase.deploy("0x1Cc33A0ae55C250F66B8f9A1a3094bF285A9083f", URI, "https://server-prod.ideamarket.io/post-metadata/", ethers.utils.parseEther(".001"), { gasLimit: ethers.BigNumber.from(200000000)});
	await opinionBase.deployed();

	console.log(`[$]: npx hardhat verify --network <> ${opinionBase.address}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
"0x1Cc33A0ae55C250F66B8f9A1a3094bF285A9083f" 'data:application/json;base64,eyJuYW1lIjogIklkZWFtYXJrZXQgUG9zdHMiLCJkZXNjcmlwdGlvbiI6ICJJZGVhbWFya2V0IFBvc3QgdGhhdCB0cmFja3MgcHVibGljIG9waW5pb24gd2l0aG91dCB0cnVzdGVkIHRoaXJkIHBhcnRpZXMg4oCUIGEgY29sbGVjdGlibGUgYmVsaWVmISIsImltYWdlIjogImh0dHBzOi8vaWJiLmNvLzVZOG5RaEoiLCJleHRlcm5hbF9saW5rIjogImh0dHBzOi8vaWRlYW1hcmtldC5pby8iLCAic2VsbGVyX2ZlZV9iYXNpc19wb2ludHMiOiA1MDAsICJmZWVfcmVjaXBpZW50IjogIjB4MUNjMzNBMGFlNTVDMjUwRjY2QjhmOUExYTMwOTRiRjI4NUE5MDgzZiJ9' "https://server-prod.ideamarket.io/post-metadata/" "1000000000000000"