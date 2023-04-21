let chai = require('chai');
const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config.js');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');
const { deploy } = require('../../utils/helper.js');
chai.should();
chai.use(require('chai-things'));
const { assert, expect } = chai;
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

function hashToken(address, amount) {
	return ethers.utils.solidityKeccak256(
		['address', 'uint256'],
		[address.toLowerCase(), amount]
	);
}

const DEFAULT_NFT_PER_WHITELIST = 2;
!developmentChains.includes(network.name)
	? describe.skip
	: describe('MerkleTree', async () => {
			let minter, deployer, merkleTree, whitelist;
			let root, leafs;
			beforeEach(async function () {
				whitelist = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;

				leafs = whitelist
					.map((c) => {
						return {
							address: c.address,
							amount: DEFAULT_NFT_PER_WHITELIST,
						};
					})
					.map((addr) => hashToken(addr.address, addr.amount));

				merkleTree = new MerkleTree(leafs, keccak256, {
					sortPairs: true,
				});

				root = merkleTree.getHexRoot();
			});
			describe('merkle proof auth', async () => {
				beforeEach(async function () {
					minter = await deploy('Airdrop', 'Name', 'Symbol', root);
				});
				it('not whitelisted reveredWith InvalidProof', async () => {
					const leaf = hashToken(
						'0xcEb14F8236C6aAE1085929fDFf1Af2b47D39864f',
						DEFAULT_NFT_PER_WHITELIST
					);

					const proof = merkleTree.getHexProof(leaf);

					await expect(minter.whitelistMint(2, proof)).to.be.revertedWithCustomError(
						minter,
						'Airdrop__InvalidProof'
					);
				});
				it('whitelisted mint should emit Transfer', async () => {
					const leaf = hashToken(whitelist[4].address, DEFAULT_NFT_PER_WHITELIST);
					const proofHex = merkleTree.getHexProof(leaf);
					await expect(
						minter
							.connect(whitelist[4])
							.whitelistMint(DEFAULT_NFT_PER_WHITELIST, proofHex)
					)
						.to.emit(minter, 'Transfer')
						.withArgs(ethers.constants.AddressZero, whitelist[4].address, anyValue);
				});
			});
			describe('mint nfts', async () => {
				beforeEach(async function () {
					minter = await deploy('Airdrop', 'Name', 'Symbol', root);
				});

				it('whitelisted wallet try mint two times revertedWith AlreadyClaimed', async () => {
					const walletNumber = 12;
					const leaf = leafs[walletNumber];
					const signer = whitelist[walletNumber];
					const proof = merkleTree.getHexProof(leaf);

					await minter
						.connect(signer)
						.whitelistMint(DEFAULT_NFT_PER_WHITELIST, proof)
						.then((c) => c.wait(1));

					await expect(
						minter.connect(signer).whitelistMint(2, proof)
					).to.be.revertedWithCustomError(minter, 'Airdrop__AlreadyClaimed');
					expect(await minter.balanceOf(signer.address)).to.equal(1);
				});

				it('all whitelisted wallets minting nfts', async () => {
					const mintAllTask = leafs.map((leaf, i) => {
						const proofHex = merkleTree.getHexProof(leaf);
						return minter
							.connect(whitelist[i])
							.whitelistMint(DEFAULT_NFT_PER_WHITELIST, proofHex);
					});

					await Promise.all(mintAllTask).catch((e) => {
						return expect.fail(e);
					});
					const minterBalances = await Promise.all(
						whitelist.map((signer) => {
							return minter.balanceOf(signer.address);
						})
					);
					const claimed = await Promise.all(
						whitelist.map((signer) => {
							return minter.claimed(signer.address);
						})
					);

					expect(minterBalances.map((c) => c.toString()).every((c) => c === '1')).to
						.be.true;
					expect(claimed.every((c) => c === true)).to.be.true;
				});
			});
	  });
