const { assert, expect } = require('chai');
const { deployments, network, ethers, getNamedAccounts } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../../../helper-hardhat-config.js');
const {
	callAndWait,
	getEvent,
	getEvents,
} = require('../../../utils/helper.js');
!developmentChains.includes(network.name)
	? describe.skip
	: describe('nftstaker MINTER', async () => {
			const chainConfigs = networkConfig[network.config.chainId].nftstaker;
			let rewardToken, staker, minter, deployer, nftMintPrice, saleTime, limit;

			beforeEach(async function () {
				[owner, signer1, signer2, signer3] = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['nftstaker']);

				rewardToken = await ethers.getContract('ERC20Rewards', deployer);
				staker = await ethers.getContract('Staker', deployer);
				minter = await ethers.getContract('TokenMinter', deployer);
				const saleData = await minter.getSalesData();

				nftMintPrice = saleData.mintRate;
				saleTime = saleData.saleTime;
				limit = saleData.maximumPerAccount;
			});

			describe('TokenMinter', async () => {
				it('constructor', async () => {
					expect(saleTime.toNumber()).to.be.equal(chainConfigs.saleStartTime);
					expect(nftMintPrice).to.be.equal(chainConfigs.saleMintPrice);
					expect(limit).to.be.equal(chainConfigs.salePerAccount);
				});
				it('deployer should be able to mint', async () => {
					await callAndWait(minter, 'mint', {
						args: [1],
						from: owner,
						value: nftMintPrice,
					});
					await callAndWait(minter, 'mint', {
						args: [2],
						from: owner,
						value: nftMintPrice.mul(2),
					});

					const ownerTokens = await minter.balanceOf(owner.address);

					expect(ownerTokens).to.be.equal(3);
				});

				it('should allow signer to mint nft', async () => {
					const receipt = await callAndWait(minter, 'mint', {
						args: [1],
						from: signer1,
						value: nftMintPrice,
					});
					const mintedTokenId = getEvent(receipt, 'Minted', (event) => {
						return event.args.tokenId;
					});
					const ownerTokens = await minter.balanceOf(signer1.address);
					const owner = await minter.ownerOf(mintedTokenId);
					expect(ownerTokens).to.be.equal(1);
					assert(owner === signer1.address, 'owner not correct');
				});

				it('signer mint many and owner of them', async () => {
					const receipt = await callAndWait(minter, 'mint', {
						args: [3],
						from: signer1,
						value: nftMintPrice.mul(3),
					});
					const mintedTokenId = getEvents(receipt, 'Minted', (event) => {
						return event.args.tokenId;
					});
					const owners = await Promise.all(
						mintedTokenId.map((tokenId) => {
							return minter.ownerOf(tokenId);
						})
					);
					const isAllEqual = owners.every((item) => item === signer1.address);

					assert(true === isAllEqual);
				});

				it('should revoke signer to mint 3 NFTS for the price of 1 ', async () => {
					await expect(
						callAndWait(minter, 'mint', {
							args: [3],
							from: signer2,
							value: nftMintPrice,
						})
					).to.be.revertedWithCustomError(minter, 'TokenMinter__LowValue');
				});

				it('should revoke signer to mint more then wallet limit', async () => {
					await expect(
						callAndWait(minter, 'mint', {
							args: [chainConfigs.salePerAccount + 1],
							from: signer2,
							value: nftMintPrice.mul(chainConfigs.salePerAccount + 1),
						})
					).to.be.revertedWithCustomError(minter, 'TokenMinter__AmountLimit');
				});
				it('should revoke signer to mint more then wallet limit 2', async () => {
					await callAndWait(minter, 'mint', {
						args: [chainConfigs.salePerAccount],
						from: signer2,
						value: nftMintPrice.mul(chainConfigs.salePerAccount),
					});
					await expect(
						callAndWait(minter, 'mint', {
							args: [1],
							from: signer2,
							value: nftMintPrice,
						})
					).to.be.revertedWithCustomError(minter, 'TokenMinter__AmountLimit');
				});

				it('should refund if over on mint nft', async () => {
					const addr1 = signer3;
					const startingBalance = await addr1.getBalance();
					const gasPrice = await ethers.provider.getGasPrice();

					const receipt = await callAndWait(minter, 'mint', {
						args: [1],
						from: addr1,
						value: nftMintPrice.mul(10),
					});
					const gasUsed = gasPrice.mul(receipt.gasUsed);

					const endingBalance = await addr1.getBalance();

					expect(endingBalance.add(nftMintPrice).add(gasUsed)).to.be.equal(
						startingBalance
					);
					assert(endingBalance.lt(startingBalance), 'bb');
				});
			});
	  });
