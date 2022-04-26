const { expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')
const keccak256 = require('keccak256')

describe("IdeamarketPosts", () => {
    let alice, bob, charlie
    let ideamarketPosts
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        alice = accounts[0];
        bob = accounts[1];
        charlie = accounts[2];
        const IdeamarketPosts = await ethers.getContractFactory("IdeamarketPosts");
        ideamarketPosts = await IdeamarketPosts.deploy(alice.address);
        await ideamarketPosts.deployed();
    })

    it("should mint post", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['minter']).to.deep.equal(alice.address);
        expect(post['content']).to.deep.equal('I love ideamarket!');
        expect(post['categories'].length).to.deep.equal(0);
        expect(post['imageLink']).to.deep.equal('');
        expect(post['isURL']).to.deep.equal(false);
        expect(post['urlContent']).to.deep.equal('');
    })

    it("should mint url post", async () => {
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", [], "", 
            true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['minter']).to.deep.equal(alice.address);
        expect(post['content']).to.deep.equal('https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY');
        expect(post['categories'].length).to.deep.equal(0);
        expect(post['imageLink']).to.deep.equal('');
        expect(post['isURL']).to.deep.equal(true);
        expect(post['urlContent']).to.deep.equal('');
    })

    it("should mint web2 post", async () => {
        await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", [], "", 
            true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['minter']).to.deep.equal(alice.address);
        expect(post['content']).to.deep.equal('https://twitter.com/boreasrex/status/1515005721993224195');
        expect(post['categories'].length).to.deep.equal(0);
        expect(post['imageLink']).to.deep.equal('');
        expect(post['isURL']).to.deep.equal(true);
        expect(post['urlContent']).to.deep.equal('kinda worried that 8 eth for my milady is too cheap..');
    })

    it("should fail mint with no content", async () => {
        await expectRevert(ideamarketPosts.connect(alice).mint("", [], "", 
            true, "kinda worried that 8 eth for my milady is too cheap..", alice.address), 'content-empty');
    })

    it("should fail mint with 0x0 recipient", async () => {
        await expectRevert(ideamarketPosts.connect(alice).mint("hi", [], "", 
            true, "kinda worried that 8 eth for my milady is too cheap..", '0x0000000000000000000000000000000000000000'), 'zero-addr');
    })

    it("should be able add and use a category tag", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A'], "", 
            true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(1);
        expect(post['categories'][0]).to.deep.equal('A');
    })

    it("can pull valid category", async () => {
        await ideamarketPosts.connect(alice).addCategories(['hi']);
        const categories = await ideamarketPosts.getActiveCategories();
        expect(categories.length).to.deep.equal(1);
        expect(categories[0]).to.deep.equal('hi');
    })

    it("can pull valid categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        const categories = await ideamarketPosts.getActiveCategories();
        expect(categories.length).to.deep.equal(3);
        expect(categories[0]).to.deep.equal('A');
        expect(categories[1]).to.deep.equal('B');
        expect(categories[2]).to.deep.equal('C');
    })

    it("should be able add and use multiple categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
            true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(2);
        expect(post['categories'][0]).to.deep.equal('A');
        expect(post['categories'][1]).to.deep.equal('B');
    })

    it("should only be able to tag with valid categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", [""], "", 
            true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(0);
    })

    it("should only be able keep valid categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ["", 'A', 'C', 'D'], "", 
            true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(2);
        expect(post['categories'][0]).to.deep.equal('A');
        expect(post['categories'][1]).to.deep.equal('C');
    })

    it("tokenURI should work web2url without categories", async () => {
        const tx = await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", [], "", 
            true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        const expectedURI = "data:application/json;base64," + Buffer.from("{'minter': '" + alice.address.toLowerCase() + "'," +
        "'content': 'https://twitter.com/boreasrex/status/1515005721993224195'," +
        "'image': '','categories': '[]','isURL': '1','urlContent': 'kinda worried that 8 eth for my milady is too cheap..'," +
        "'blockHeight': '" + tx['blockNumber'] + "'}").toString( "base64");
        expect(uri).to.deep.equal(expectedURI);
    })

    it("tokenURI should work for post", async () => {
        const tx = await ideamarketPosts.connect(alice).mint("I love Ideamarket!", [], "", 
            false, "", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        const expectedURI = "data:application/json;base64," + Buffer.from("{'minter': '" + alice.address.toLowerCase() + "'," +
        "'content': 'I love Ideamarket!'," +
        "'image': '','categories': '[]','isURL': '0','urlContent': ''," +
        "'blockHeight': '" + tx['blockNumber'] + "'}").toString( "base64");
        expect(uri).to.deep.equal(expectedURI);
    })

    it("tokenURI should work with categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A']);
        const tx = await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", ["A"], "", 
            true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        const aliceAddress = alice.address.toLowerCase()
        const expectedURI = "data:application/json;base64," + Buffer.from("{'minter': '" + aliceAddress + "'," +
        "'content': 'https://twitter.com/boreasrex/status/1515005721993224195'," +
        "'image': '','categories': '[A]','isURL': '1','urlContent': 'kinda worried that 8 eth for my milady is too cheap..'," +
        "'blockHeight': '" + tx['blockNumber'] + "'}").toString( "base64");
        expect(uri).to.deep.equal(expectedURI);
    })

    it("tokenURI data should work with multiple categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        const tx = await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", ["A", "", "C"], "", 
            true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        const aliceAddress = alice.address.toLowerCase()
        const expectedURI = "data:application/json;base64," + Buffer.from("{'minter': '" + aliceAddress + "'," +
        "'content': 'https://twitter.com/boreasrex/status/1515005721993224195'," +
        "'image': '','categories': '[A, C]','isURL': '1','urlContent': 'kinda worried that 8 eth for my milady is too cheap..'," +
        "'blockHeight': '" + tx['blockNumber'] + "'}").toString( "base64");
        expect(uri).to.deep.equal(expectedURI);
    })

    it("tokenURI for nonexistent token should fail", async () => {
        await expectRevert(ideamarketPosts.tokenURI(1), "ERC721Metadata: URI query for nonexistent token");
    })

    it("getPost for nonexistent token should fail", async () => {
        await expectRevert(ideamarketPosts.getPost(1), "nonexistent token");
    })

    it("should fetch mintedTokens for a given address", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", alice.address);
        await ideamarketPosts.connect(alice).mint("hi", [], "", 
            false, "", alice.address);
        const posts = await ideamarketPosts.getUsersPosts(alice.address);
        expect(posts.length).to.deep.equal(2);
        expect(posts[0]).to.deep.equal(1);
        expect(posts[1]).to.deep.equal(2);
    })

    it("admin can add other admins", async () => {
        await ideamarketPosts.connect(alice).grantRole(keccak256("ADMIN_ROLE"), bob.address);
        expect(await ideamarketPosts.hasRole(keccak256("ADMIN_ROLE"), bob.address)).to.be.true;
        await ideamarketPosts.connect(bob).addCategories(['A']);
        const categories = await ideamarketPosts.getActiveCategories();
        expect(categories.length).to.deep.equal(1);
    })

    it("only admin can add/remove categories", async () => {
        await expectRevert(ideamarketPosts.connect(bob).addCategories(['A']), 'admin-only');
        await expectRevert(ideamarketPosts.connect(bob).removeCategories(['A']), 'admin-only');
    })

    it("admin should remove category", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A']);
        await ideamarketPosts.connect(alice).removeCategories(['A']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A'], "", 
            true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(0);
        const categories = await ideamarketPosts.getActiveCategories();
        expect(categories.length).to.deep.equal(0);
    })

    it("admin should remove multiple categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).removeCategories(['A','C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'C', 'B'], "", 
        true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(1);
        expect(post['categories'][0]).to.deep.equal('B');
        const categories = await ideamarketPosts.getActiveCategories();
        expect(categories.length).to.deep.equal(1);
    })

    it("admin should remove all categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).removeCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'C', 'B'], "", 
        true, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(0);
        const categories = await ideamarketPosts.getActiveCategories();
        expect(categories.length).to.deep.equal(0);
    })

    it("only admin can add/remove categories from a post", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
        true, "", alice.address);
        await expectRevert(ideamarketPosts.connect(bob).addCategoriesToPost(1, ['C']), 'admin-only');
        await expectRevert(ideamarketPosts.connect(bob).resetCategoriesForPost(1, ['A']), 'admin-only');
    })

    it("admin can add categories to a post", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A'], "", 
        true, "", alice.address);
        await ideamarketPosts.connect(alice).addCategoriesToPost(1, ['C', 'B']);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(3);
        expect(post['categories'][0]).to.deep.equal('A');
        expect(post['categories'][1]).to.deep.equal('C');
        expect(post['categories'][2]).to.deep.equal('B');
    })

    it("add categories to a post that already exist should do nothing", async () => {
      await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
      await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A'], "", 
      true, "", alice.address);
      await ideamarketPosts.connect(alice).addCategoriesToPost(1, ['A', 'C', 'B']);
      const post = await ideamarketPosts.getPost(1);
      expect(post['categories'].length).to.deep.equal(3);
      expect(post['categories'][0]).to.deep.equal('A');
      expect(post['categories'][1]).to.deep.equal('C');
      expect(post['categories'][2]).to.deep.equal('B');
  })

    it("admin can reset category to a single tag from a post", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
        true, "", alice.address);
        await ideamarketPosts.connect(alice).resetCategoriesForPost(1, ['A']);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(1);
        expect(post['categories'][0]).to.deep.equal('A');
    })

    it("admin can reset multiple categories for a post", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
        true, "", alice.address);
        await ideamarketPosts.connect(alice).resetCategoriesForPost(1, ['A', 'B']);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(2);
        expect(post['categories'][0]).to.deep.equal('A');
        expect(post['categories'][1]).to.deep.equal('B');
    })

    it("admin can reset and then add multiple categories for a post ", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C', 'D']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
        true, "", alice.address);
        await ideamarketPosts.connect(alice).resetCategoriesForPost(1, ['A', 'B']);
        await ideamarketPosts.connect(alice).addCategoriesToPost(1, ['D', 'C']);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(4);
        expect(post['categories'][0]).to.deep.equal('A');
        expect(post['categories'][1]).to.deep.equal('B');
        expect(post['categories'][2]).to.deep.equal('D');
        expect(post['categories'][3]).to.deep.equal('C');
    })

    it("adding already existing category for a post should do nothing ", async () => {
      await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C', 'D']);
      await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
      true, "", alice.address);
      await ideamarketPosts.connect(alice).resetCategoriesForPost(1, ['A', 'B']);
      await ideamarketPosts.connect(alice).addCategoriesToPost(1, ['D', 'C', 'A']);
      const post = await ideamarketPosts.getPost(1);
      expect(post['categories'].length).to.deep.equal(4);
      expect(post['categories'][0]).to.deep.equal('A');
      expect(post['categories'][1]).to.deep.equal('B');
      expect(post['categories'][2]).to.deep.equal('D');
      expect(post['categories'][3]).to.deep.equal('C');
  })

    it("only admin or current token owner can update image", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", alice.address);
        await expectRevert(ideamarketPosts.connect(bob).updateImage(1, "https://ipfsimagelink"), 'only-token-owner-or-admin');
    })

    it("current token owner and admin can update image", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", bob.address);
        await ideamarketPosts.connect(alice).updateImage(1, "https://ipfsimagelink");
        let post = await ideamarketPosts.getPost(1);
        expect(post['imageLink']).to.deep.equal("https://ipfsimagelink");
        await ideamarketPosts.connect(bob).updateImage(1, "https://ipfsimagelinknew");
        post = await ideamarketPosts.getPost(1);
        expect(post['imageLink']).to.deep.equal("https://ipfsimagelinknew");
    })

    it("only admin can update URLContent", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", alice.address);
        await expectRevert(ideamarketPosts.connect(bob).updateURLContent(1, "https://ipfsimagelink"), 'admin-only');
    })

    it("cannot update URLContent for non url", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", alice.address);
        await expectRevert(ideamarketPosts.connect(alice).updateURLContent(1, "https://ipfsimagelink"), 'post-is-not-a-url');
    })

    it("admin can update urlContent", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, "", bob.address);
        await ideamarketPosts.connect(alice).updateImage(1, "https://ipfsimagelink");
        let post = await ideamarketPosts.getPost(1);
        expect(post['imageLink']).to.deep.equal("https://ipfsimagelink");
        await ideamarketPosts.connect(bob).updateImage(1, "https://ipfsimagelinkNEW");
        post = await ideamarketPosts.getPost(1);
        expect(post['imageLink']).to.deep.equal("https://ipfsimagelinkNEW");
    })

})