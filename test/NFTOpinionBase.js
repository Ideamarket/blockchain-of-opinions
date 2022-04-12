const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')

describe("NFTOpinionBase", () => {
	
    const token1Address = "0x0000000000000000000000000000000000000001";
	const token2Address = "0x0000000000000000000000000000000000000002";
	let alice, bob, charlie
	let opinionBase
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
		alice = accounts[0];
		bob = accounts[1];
		charlie = accounts[2];
        const OpinionBase = await ethers.getContractFactory("NFTOpinionBase");
		opinionBase = await OpinionBase.deploy();
	})

	it("should write opinion", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1,  98, "I like this url a lot");
		const opinion = await opinionBase.getOpinion(token1Address, 1, alice.address);
		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

	it("should write short opinion", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "I like");
		const opinion = await opinionBase.getOpinion(token1Address, 1,  alice.address);
		expect(opinion[0]['comment']).to.equal("I like");
		expect(opinion[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

	it("should write opinion w/out comment", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "");
		const opinion = await opinionBase.getOpinion(token1Address, 1,  alice.address);
		expect(opinion[0]['comment']).to.equal("");
		expect(opinion[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
	})

	it("should fail with opinion w/ comment greater than 560 char", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "i like thissssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
			+ "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
			+ "ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss"), 
			"comment must be lte 560 characters");
	})

	it("should write and fetch users opinion", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "");
		const opinion = await opinionBase.getOpinion(token1Address, 1,  alice.address);
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
	})

	it("should fetch opinion on topic", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "");
		const fetchedOpinions = await opinionBase.getOpinionsAboutNFT(token1Address, 1);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
		expect(fetchedOpinions.length).to.equal(1);
	})

	it("should fetch latest opinion on topic", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "");
		const fetchedOpinions = await opinionBase.getLatestOpinionsAboutNFT(token1Address, 1);
		expect(fetchedOpinions[0]['comment']).to.equal("");
		expect(fetchedOpinions[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
		expect(fetchedOpinions.length).to.equal(1);
	})

	it("should fetch opinined tokenIDPairs", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "I like this url a lot");
		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]["contractAddress"]).to.equal(token1Address);
		expect(opinedNFTs[0]["tokenID"]).to.equal(1);
		expect(opinedNFTs.length).to.equal(1);
	})

	it("write and fetch multiple opinions from the same person about same token", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "I like this url a lot");
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 45, "I like this url a little");

		const opinion = await opinionBase.getOpinion(token1Address, 1,  alice.address);

		expect(opinion[0]['comment']).to.equal("I like this url a lot");
		expect(opinion[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);

		expect(opinion[1]['comment']).to.equal("I like this url a little");
		expect(opinion[1]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinion[1]['rating']).to.equal(45);
		expect(opinion[1]['author']).to.equal(alice.address);
		
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinions[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(fetchedOpinions[1]["comment"]).to.equal(opinion[1]["comment"]);

		const opinionsAboutNFT = await opinionBase.getOpinionsAboutNFT(token1Address, 1);
		expect(opinionsAboutNFT[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(opinionsAboutNFT[1]["comment"]).to.equal(opinion[1]["comment"]);

		const latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(token1Address, 1);
		expect(latestOpinionsAboutNFT[0]["comment"]).to.equal(opinion[1]["comment"]);
		expect(latestOpinionsAboutNFT.length).to.equal(1);

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]["contractAddress"]).to.equal(token1Address);
		expect(opinedNFTs[0]["tokenID"]).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal(opinion[0]["comment"]);
		expect(allOpinions.length).to.equal(2);

	})

	it("write and fetch multiple opinions from the same person about different address", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "I like this url a lot");
		await opinionBase.connect(alice).writeOpinion(token2Address, 2, 45, "I like this url a little");

		const opinionTokenOne = await opinionBase.getOpinion(token1Address, 1,  alice.address);
		const opinionTokenTwo = await opinionBase.getOpinion(token2Address, 2, alice.address);

		expect(opinionTokenOne[0]['comment']).to.equal("I like this url a lot");
		expect(opinionTokenOne[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionTokenOne[0]['rating']).to.equal(98);
		expect(opinionTokenOne[0]['author']).to.equal(alice.address);

		expect(opinionTokenTwo[0]['comment']).to.equal("I like this url a little");
		expect(opinionTokenTwo[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000002");
		expect(opinionTokenTwo[0]['rating']).to.equal(45);
		expect(opinionTokenTwo[0]['author']).to.equal(alice.address);
		
		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinionsAlice[0]["comment"]).to.equal("I like this url a lot");
		expect(fetchedOpinionsAlice[1]["comment"]).to.equal("I like this url a little");

		const opinionsAboutNFT1 = await opinionBase.getOpinionsAboutNFT(token1Address, 1);
		expect(opinionsAboutNFT1[0]["comment"]).to.equal("I like this url a lot");

		const opinionsAboutNFT2 = await opinionBase.getOpinionsAboutNFT(token2Address, 2);
		expect(opinionsAboutNFT2[0]["comment"]).to.equal("I like this url a little");

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]["contractAddress"]).to.equal(token1Address);
		expect(opinedNFTs[1]["contractAddress"]).to.equal(token2Address);
        expect(opinedNFTs[0]["tokenID"]).to.equal(1);
		expect(opinedNFTs[1]["tokenID"]).to.equal(2);
        expect(opinedNFTs.length).to.equal(2);


		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal("I like this url a lot");
		expect(allOpinions[1]["comment"]).to.equal("I like this url a little");
		expect(allOpinions.length).to.equal(2);
	})

	it("write and fetch multiple opinions from different people about same address", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "I like this url a lot");
		await opinionBase.connect(bob).writeOpinion(token1Address, 1, 45, "I like this url a little");
		
		const opinionAlice = await opinionBase.getOpinion(token1Address, 1,  alice.address);
		expect(opinionAlice[0]['comment']).to.equal("I like this url a lot");
		expect(opinionAlice[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionAlice[0]['rating']).to.equal(98);
		expect(opinionAlice[0]['author']).to.equal(alice.address);
		
		const opinionBob = await opinionBase.getOpinion(token1Address, 1, bob.address);
		expect(opinionBob[0]['comment']).to.equal("I like this url a little");
		expect(opinionBob[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
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

		const opinionsAboutNFT = await opinionBase.getOpinionsAboutNFT(token1Address, 1);
		expect(opinionsAboutNFT[0]["comment"]).to.equal("I like this url a lot");
		expect(opinionsAboutNFT[1]["comment"]).to.equal("I like this url a little");

		const latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(token1Address, 1);
		expect(latestOpinionsAboutNFT[0]["comment"]).to.equal("I like this url a lot");
		expect(latestOpinionsAboutNFT[1]["comment"]).to.equal("I like this url a little");

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]["contractAddress"]).to.equal(token1Address);
        expect(opinedNFTs[0]["tokenID"]).to.equal(1);
		expect(opinedNFTs.length).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal("I like this url a lot");
		expect(allOpinions[1]["comment"]).to.equal("I like this url a little");
		expect(allOpinions.length).to.equal(2);
	})

	it("integration test", async () => {
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 98, "I like this url a lot");
		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 42, "I don't like");
		await opinionBase.connect(bob).writeOpinion(token1Address, 1, 45, "I like this url a little");
		
		const opinionAlice = await opinionBase.getOpinion(token1Address, 1,  alice.address);
		expect(opinionAlice[0]['comment']).to.equal("I like this url a lot");
		expect(opinionAlice[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionAlice[0]['rating']).to.equal(98);
		expect(opinionAlice[0]['author']).to.equal(alice.address);
		expect(opinionAlice[1]['comment']).to.equal("I don't like");

		const opinionBob = await opinionBase.getOpinion(token1Address, 1, bob.address);
		expect(opinionBob[0]['comment']).to.equal("I like this url a little");
		expect(opinionBob[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
		expect(opinionBob[0]['rating']).to.equal(45);
		expect(opinionBob[0]['author']).to.equal(bob.address);

		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		const fetchedOpinionsBob = await opinionBase.getUsersOpinions(bob.address);
		expect(fetchedOpinionsAlice[0]["comment"]).to.equal("I like this url a lot");
		expect(fetchedOpinionsBob[0]["comment"]).to.equal("I like this url a little");

		expect(opinionAlice.length).to.equal(2);
		expect(opinionBob.length).to.equal(1);
		
		expect(fetchedOpinionsAlice.length).to.equal(2);
		expect(fetchedOpinionsBob.length).to.equal(1);

		const opinionsAboutNFT = await opinionBase.getOpinionsAboutNFT(token1Address, 1);
		expect(opinionsAboutNFT[0]["comment"]).to.equal("I like this url a lot");
		expect(opinionsAboutNFT[1]["comment"]).to.equal("I don't like");
		expect(opinionsAboutNFT[2]["comment"]).to.equal("I like this url a little");

		let latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(token1Address, 1);
		expect(latestOpinionsAboutNFT[0]["comment"]).to.equal("I don't like");
		expect(latestOpinionsAboutNFT[1]["comment"]).to.equal("I like this url a little");
		expect(latestOpinionsAboutNFT.length).to.equal(2);

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]["contractAddress"]).to.equal(token1Address);
		expect(opinedNFTs[0]["tokenID"]).to.equal(1);
		expect(opinedNFTs.length).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["comment"]).to.equal("I like this url a lot");
		expect(allOpinions[1]["comment"]).to.equal("I don't like");
		expect(allOpinions[2]["comment"]).to.equal("I like this url a little");
		expect(allOpinions.length).to.equal(3);

		await opinionBase.connect(alice).writeOpinion(token1Address, 1, 20, "I love this!");

		latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(token1Address, 1);
		expect(latestOpinionsAboutNFT[0]["comment"]).to.equal("I love this!");
		expect(latestOpinionsAboutNFT[1]["comment"]).to.equal("I like this url a little");
		expect(latestOpinionsAboutNFT.length).to.equal(2);
	})
	
	it("emmited event should be connect", async () => {
		expect(opinionBase.connect(alice).writeOpinion(token1Address, 1,  98, "I like this url a lot")).
		to.emit(opinionBase, "OpinionWritten").withArgs(alice.address, token1Address, 1,  98, "I like this url a lot",);
	})

})
