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
		await opinionBase.writeOpinion(token1Address, 98, "I like this url a lot", {from: alice.address});
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['hasComment']).to.equal(true);
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
	})

	it("should write opinion w/out comment", async () => {
		await opinionBase.writeOpinion(token1Address, 98, "", {from: alice.address});
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		expect(opinion[0]['comment']).to.equal("");
		expect(opinion[0]['hasComment']).to.equal(false);
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
	})

	it("should write and fetch users opinion", async () => {
		await opinionBase.writeOpinion(token1Address, 98, "", {from: alice.address});
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['hasComment']).to.equal(false);
		expect(fetchedOpinions[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
	})

	it("should fetch opinion on topic", async () => {
		await opinionBase.writeOpinion(token1Address, 98, "", {from: alice.address});
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		const fetchedOpinions = await opinionBase.getOpinionsAboutAddress(token1Address);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['hasComment']).to.equal(false);
		expect(fetchedOpinions[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
	})

	it("should fetch opinined Addresses", async () => {
		await opinionBase.writeOpinion(token1Address, 98, "", {from: alice.address});
		const opinedAddresses = await opinionBase.getOpinedAddresses();
		expect(opinedAddresses[0]).to.equal(token1Address);
	})

	it("write and fetch multiple opinions from the same person about same address", async () => {
		await opinionBase.writeOpinion(token1Address, 98, "I like this url a lot", {from: alice.address});
		await opinionBase.writeOpinion(token1Address, 45, "I like this url a little", {from: alice.address});
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);

		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['hasComment']).to.equal(true);
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);

		expect(opinion[1]['comment']).to.equal("I like this url a little");
		expect(opinion[1]['hasComment']).to.equal(true);
		expect(opinion[1]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[1]['rating']).to.equal(45);
		expect(opinion[1]['author']).to.equal(alice.address);
		console.log(opinion);
		
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		console.log(fetchedOpinions);
		expect(fetchedOpinions[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(fetchedOpinions[1]["comment"]).to.equal(opinion[1]["comment"]);

		const opinionsAboutAddress = await opinionBase.getOpinionsAboutAddress(token1Address);
		expect(opinionsAboutAddress[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(opinionsAboutAddress[1]["comment"]).to.equal(opinion[1]["comment"]);

		const opinedAddresses = await opinionBase.getOpinedAddresses();
		expect(opinedAddresses[0]).to.equal(token1Address);
	})
	

	//multiple opinions same person same token
	// multiple opinions same person different token
	// event test




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
