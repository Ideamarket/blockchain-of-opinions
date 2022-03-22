const { expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')

describe("OpinionBase", () => {
	
    const token1Address = "0x0000000000000000000000000000000000000001";
	const token2Address = "0x0000000000000000000000000000000000000002";
	let alice, bob, charlie
	let opinionBase
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
		alice = accounts[0];
		bob = accounts[1];
		charlie = accounts[2];
        const OpinionBase = await ethers.getContractFactory("OpinionBase");
		opinionBase = await OpinionBase.deploy();
	})

	it("should write opinion", async () => {
		await opinionBase.writeOpinion(token1Address, 98, "I like this url a lot", true, {from: alice.address});
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['hasComment']).to.equal(true);
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
	})

	/*it("Should return the new greeting once it's changed", async () => {
		const Greeter = await ethers.getContractFactory("Greeter");
		const greeter = await Greeter.deploy("Hello, world!");
		await greeter.deployed();

		expect(await greeter.greet()).to.equal("Hello, world!");

		const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

		// wait until the transaction is mined
		await setGreetingTx.wait();

		expect(await greeter.greet()).to.equal("Hola, mundo!");
	});
	*/
})
