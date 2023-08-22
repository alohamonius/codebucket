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
	getOwners,
	toSeconds,
} = require('../../../utils/helper.js');
!developmentChains.includes(network.name)
	? describe.skip
	: describe('nftstaker STAKER', async () => {
			const chainConfigs = networkConfig[network.config.chainId].nftstaker;
			let rewardToken, staker, nft, deployer, nftMintPrice, saleTime, limit;

			beforeEach(async function () {
				[owner, signer1, signer2, signer3] = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['nftstaker']);

				rewardToken = await ethers.getContract('ERC20Rewards', deployer);
				staker = await ethers.getContract('Staker', deployer);
				nft = await ethers.getContract('TokenMinter', deployer);
				const saleData = await nft.getSalesData();

				nftMintPrice = saleData.mintRate;
				saleTime = saleData.saleTime;
				limit = saleData.maximumPerAccount;
			});

			describe('basics', () => {
				it('constructor', async () => {
					const nftAddress = await staker.getStakeItemAddress();
					const rewardAddress = await staker.getRewardAddress();

					assert(nftAddress === nft.address);
					assert(rewardAddress === rewardToken.address);
				});
			});
			describe('after nft minted', async () => {
				//double claim
				let mintedTokenId;
				beforeEach(async function () {
					const mintReceipt = await callAndWait(nft, 'mint', {
						args: [1],
						from: signer1,
						value: nftMintPrice,
					});
					mintedTokenId = getEvent(mintReceipt, 'Minted', (event) => {
						return event.args.tokenId.toString();
					});
					await callAndWait(nft, 'approve', {
						args: [staker.address, mintedTokenId],
						from: signer1,
					});
				});
				it('stake should working proper', async () => {
					const stakeReceipt = await callAndWait(staker, 'stake', {
						args: [[mintedTokenId]],
						from: signer1,
						value: nftMintPrice,
					});
					const stakedTokenId = getEvent(stakeReceipt, 'Staked', (event) => {
						return event.args.tokenId.toString();
					});
					const ow = await staker.getTokenVault(stakedTokenId);
					const ownerOfMintedNft = await nft.ownerOf(mintedTokenId);

					assert(ownerOfMintedNft === staker.address);
					assert(ow.owner === signer1.address);
					assert(stakedTokenId !== null);
					assert(stakedTokenId === mintedTokenId);
				});
				it('claim after reward period should correct calculate rewards ', async () => {
					const stakeReceipt = await callAndWait(staker, 'stake', {
						args: [[mintedTokenId]],
						from: signer1,
						value: nftMintPrice,
					});
					const stakedTokenId = getEvent(stakeReceipt, 'Staked', (event) => {
						return event.args.tokenId.toString();
					});

					await network.provider.send('evm_increaseTime', [
						chainConfigs.rewardsPeriod,
					]);

					const claimReceipt = await callAndWait(staker, 'claim', {
						args: [],
						from: signer1,
						value: nftMintPrice,
					});
					const claimedData = getEvent(claimReceipt, 'Claimed', (event) => {
						return {
							owner: event.args.owner,
							value: event.args.value,
						};
					});
					const stakedNftData = await staker.getTokenVault(stakedTokenId);

					const rewardBalanceAfterClaim = await rewardToken.balanceOf(
						signer1.address
					);

					assert(rewardBalanceAfterClaim !== 0, 'Invalid reward balance');
					assert(claimedData.value !== 0, 'Invalid claimed reward value');
					assert(
						claimedData.value == chainConfigs.rewardsPerPeriod,
						'Incorrect reward amount'
					);
					assert(stakedTokenId === mintedTokenId, 'Staked token ID mismatch');

					assert(claimedData.owner === signer1.address, 'Incorrect reward owner');
					assert(stakedNftData !== null, 'No staked NFT found');
					assert(stakedNftData.owner === signer1.address, 'Incorrect NFT owner');
					assert(
						stakedNftData.tokenId.toString() === mintedTokenId,
						'Incorrect NFT ID'
					);
				});
				it('stake and claim many', async () => {
					const mintReceipt = await mintAndApprove(
						nft,
						staker,
						signer2,
						chainConfigs.salePerAccount,
						nftMintPrice.mul(chainConfigs.salePerAccount)
					);
					const mintedTokenIds = getEvents(mintReceipt, 'Minted', (event) => {
						return event.args.tokenId;
					});
					const stakeReceipt = await callAndWait(staker, 'stake', {
						args: [mintedTokenIds],
						from: signer2,
					});
					const stakedTokenIds = getEvents(stakeReceipt, 'Staked', (event) => {
						return event.args.tokenId;
					});

					await network.provider.send('evm_increaseTime', [
						chainConfigs.rewardsPeriod,
					]);

					const claimReceipt = await callAndWait(staker, 'claim', {
						args: [],
						from: signer2,
					});
					const claimedData = getEvent(claimReceipt, 'Claimed', (event) => {
						return {
							owner: event.args.owner,
							value: event.args.value,
						};
					});

					const rewardBalanceAfterClaim = await rewardToken.balanceOf(
						signer2.address
					);
					const expectedRewardAmount =
						chainConfigs.rewardsPerPeriod * chainConfigs.salePerAccount;

					assert.deepStrictEqual(
						stakedTokenIds,
						mintedTokenIds,
						'TokenIds is not the same'
					);
					assert(
						claimedData.value == expectedRewardAmount,
						'Incorrect reward amount'
					);

					assert(rewardBalanceAfterClaim !== 0, 'Invalid reward balance');
					assert(
						rewardBalanceAfterClaim == expectedRewardAmount,
						'Invalid reward balance'
					);
				});
				it('mint max per wallet and stake them, withdraw few should be as expected', async () => {
					nft = await ethers.getContract('TokenMinter', signer2);
					staker = await ethers.getContract('Staker', signer2);

					const mintReceipt = await mintAndApprove(
						nft,
						staker,
						signer2,
						chainConfigs.salePerAccount,
						nftMintPrice.mul(chainConfigs.salePerAccount)
					);
					const balanceBeforeWithdrawAndStake = await nft.balanceOf(signer2.address);

					const mintedTokenIds = getEvents(mintReceipt, 'Minted', (event) => {
						return event.args.tokenId;
					});
					const withdrawTokenIds = mintedTokenIds.slice(0, 2);
					const stakeReceipt = await callAndWait(staker, 'stake', {
						args: [mintedTokenIds],
						from: signer2,
					});

					const stakedTokenIds = getEvents(stakeReceipt, 'Staked', (event) => {
						return event.args.tokenId;
					});
					const ownerOfStakedTokens = await getOwners(nft, stakedTokenIds);

					const withdrawReceipt = await callAndWait(staker, 'withdraw', {
						args: [withdrawTokenIds],
						from: signer2,
					});
					const balanceAfterWithdrawn = await nft.balanceOf(signer2.address);

					const withdrawnEvents = getEvents(
						withdrawReceipt,
						'Withdrawn',
						(event) => {
							return {
								owner: event.args.owner,
								when: event.args.when,
								tokenId: event.args.tokenId,
							};
						}
					);

					const withdrawnTokenIdsInfo = await Promise.all(
						withdrawTokenIds.map((tokenId) => {
							return staker.getTokenVault(tokenId);
						})
					);
					assert.isTrue(
						withdrawnTokenIdsInfo.every(
							(tokenIdVault) => tokenIdVault.owner === ethers.constants.AddressZero
						)
					);
					assert.isTrue(
						ownerOfStakedTokens.every((owner) => owner === staker.address)
					);

					assert.deepStrictEqual(
						withdrawTokenIds,
						withdrawnEvents.map((c) => c.tokenId),
						'TokenIds is not the same'
					);
					assert(
						balanceAfterWithdrawn.eq(withdrawTokenIds.length),
						'only these tokens on signer wallet '
					);
					assert(
						balanceBeforeWithdrawAndStake.eq(chainConfigs.salePerAccount),
						`balance ${balanceBeforeWithdrawAndStake}/${chainConfigs.salePerAccount}`
					);
				});
				it('claim without stake should revert error', async () => {
					await expect(
						callAndWait(staker, 'claim', {
							args: [],
							from: signer1,
							value: nftMintPrice,
						})
					).to.be.revertedWithCustomError(staker, 'Staker__NothingToClaim');
				});
				it('claim within reward period should revert error', async () => {
					await callAndWait(staker, 'stake', {
						args: [[mintedTokenId]],
						from: signer1,
						value: nftMintPrice,
					});
					await expect(
						callAndWait(staker, 'claim', {
							args: [],
							from: signer1,
							value: nftMintPrice,
						})
					).to.be.revertedWithCustomError(staker, 'Staker__NothingToClaim');
				});
			});
	  });

async function mintAndApprove(minter, staker, from, amount, value) {
	const mintReceipt = await callAndWait(minter, 'mint', {
		args: [amount],
		from: from,
		value: value,
	});
	const mintedTokenIds = getEvents(mintReceipt, 'Minted', (event) => {
		return event.args.tokenId;
	});

	const approveAllTasks = mintedTokenIds.map((tokenId) => {
		return callAndWait(minter, 'approve', {
			args: [staker.address, tokenId],
			from: from,
		});
	});

	await Promise.all(approveAllTasks);
	return mintReceipt;
}
