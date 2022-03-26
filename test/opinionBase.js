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
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "I like this url a lot");
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

	it("should write opinion w/out comment", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "");
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		expect(opinion[0]['comment']).to.equal("");
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
	})

	it("should fail with opinion w/ comment less than 20 char", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(token1Address, 98, "i like this"), 
			"comment must be empty or between 20 and 560 characters");
	})

	it("should fail with opinion w/ comment greater than 560 char", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(token1Address, 98, "i like thissssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
			+ "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
			+ "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"), 
			"comment must be empty or between 20 and 560 characters");
	})

	it("should write and fetch users opinion", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "");
		const opinion = await opinionBase.getOpinion(token1Address, alice.address);
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
	})

	it("should fetch opinion on topic", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "");
		const fetchedOpinions = await opinionBase.getOpinionsAboutAddress(token1Address);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
		expect(fetchedOpinions.length).to.equal(1);
	})

	it("should fetch opinined Addresses", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "I like this url a lot");
		const opinedAddresses = await opinionBase.getOpinedAddresses();
		expect(opinedAddresses[0]).to.equal(token1Address);
		expect(opinedAddresses.length).to.equal(1);
	})

	it("write and fetch multiple opinions from the same person about same address", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "I like this url a lot");
		await opinionBase.connect(alice).writeOpinion(token1Address, 45, "I like this url a little");

		const opinion = await opinionBase.getOpinion(token1Address, alice.address);

		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);

		expect(opinion[1]['comment']).to.equal("I like this url a little");
		expect(opinion[1]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[1]['rating']).to.equal(45);
		expect(opinion[1]['author']).to.equal(alice.address);
		
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinions[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(fetchedOpinions[1]["comment"]).to.equal(opinion[1]["comment"]);

		const opinionsAboutAddress = await opinionBase.getOpinionsAboutAddress(token1Address);
		expect(opinionsAboutAddress[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(opinionsAboutAddress[1]["comment"]).to.equal(opinion[1]["comment"]);

		const opinedAddresses = await opinionBase.getOpinedAddresses();
		expect(opinedAddresses[0]).to.equal(token1Address);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(allOpinions.length).to.equal(2);

	})

	it("write and fetch multiple opinions from the same person about different address", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "I like this url a lot");
		await opinionBase.connect(alice).writeOpinion(token2Address, 45, "I like this url a little");

		const opinionTokenOne = await opinionBase.getOpinion(token1Address, alice.address);
		const opinionTokenTwo = await opinionBase.getOpinion(token2Address, alice.address);


		expect(opinionTokenOne[0]['comment']).to.equal("I like this url a lot");
		expect(opinionTokenOne[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionTokenOne[0]['rating']).to.equal(98);
		expect(opinionTokenOne[0]['author']).to.equal(alice.address);

		expect(opinionTokenTwo[0]['comment']).to.equal("I like this url a little");
		expect(opinionTokenTwo[0]['addy']).to.equal("0x0000000000000000000000000000000000000002");
		expect(opinionTokenTwo[0]['rating']).to.equal(45);
		expect(opinionTokenTwo[0]['author']).to.equal(alice.address);
		
		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinionsAlice[0]["comment"]).to.equal("I like this url a lot");
		expect(fetchedOpinionsAlice[1]["comment"]).to.equal("I like this url a little");

		const opinionsAboutAddress1 = await opinionBase.getOpinionsAboutAddress(token1Address);
		expect(opinionsAboutAddress1[0]["comment"]).to.equal("I like this url a lot");

		const opinionsAboutAddress2 = await opinionBase.getOpinionsAboutAddress(token2Address);
		expect(opinionsAboutAddress2[0]["comment"]).to.equal("I like this url a little");

		const opinedAddresses = await opinionBase.getOpinedAddresses();
		expect(opinedAddresses[0]).to.equal(token1Address);
		expect(opinedAddresses[1]).to.equal(token2Address);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal("I like this url a lot");
		expect(allOpinions[1]["comment"]).to.equal("I like this url a little");
		expect(allOpinions.length).to.equal(2);
	})

	it("write and fetch multiple opinions from the different people about same address", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 98, "I like this url a lot");
		await opinionBase.connect(bob).writeOpinion(token1Address, 45, "I like this url a little");
		
		const opinionAlice = await opinionBase.getOpinion(token1Address, alice.address);
		expect(opinionAlice[0]['comment']).to.equal("I like this url a lot");
		expect(opinionAlice[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionAlice[0]['rating']).to.equal(98);
		expect(opinionAlice[0]['author']).to.equal(alice.address);
		
		const opinionBob = await opinionBase.getOpinion(token1Address, bob.address);
		expect(opinionBob[0]['comment']).to.equal("I like this url a little");
		expect(opinionBob[0]['addy']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionBob[0]['rating']).to.equal(45);
		expect(opinionBob[0]['author']).to.equal(bob.address);

		
		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		const fetchedOpinionsBob = await opinionBase.getUsersOpinions(bob.address);
		expect(fetchedOpinionsAlice[0]["comment"]).to.equal("I like this url a lot");
		expect(fetchedOpinionsBob[0]["comment"]).to.equal("I like this url a little");

		expect(opinionAlice.length).to.equal(1);
		expect(opinionBob.length).to.equal(1);
		
		expect(fetchedOpinionsAlice.length).to.equal(1);
		expect(fetchedOpinionsBob.length).to.equal(1);

		const opinionsAboutAddress = await opinionBase.getOpinionsAboutAddress(token1Address);
		expect(opinionsAboutAddress[0]["comment"]).to.equal("I like this url a lot");
		expect(opinionsAboutAddress[1]["comment"]).to.equal("I like this url a little");

		const opinedAddresses = await opinionBase.getOpinedAddresses();
		expect(opinedAddresses[0]).to.equal(token1Address);
		expect(opinedAddresses.length).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal("I like this url a lot");
		expect(allOpinions[1]["comment"]).to.equal("I like this url a little");
		expect(allOpinions.length).to.equal(2);
	})
	
	it("emmited event should be connect", async () => {
		expect(opinionBase.connect(alice).writeOpinion(token1Address, 98, "I like this url a lot")).
		to.emit(opinionBase, "OpinionWritten").withArgs(alice.address, token1Address, true, 98, "I like this url a lot",);
	})

})
