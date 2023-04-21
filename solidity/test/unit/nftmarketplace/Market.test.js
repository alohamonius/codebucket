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
	toSeconds,
	now,
	gasCost,
	delay,
	networkDelay,
} = require('../../../utils/helper.js');
!developmentChains.includes(network.name)
	? describe.skip
	: describe('marketplace', async () => {
			const chainConfigs =
				networkConfig[network.config.chainId].nftmarketplace;
			let deployer, marketItem, market, marketFee, auctionPrice, weth;

			beforeEach(async function () {
				[owner, buyer, seller, signer, buyer2, buyerWithoutWeth] =
					await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['mocks', 'nftmarketplace']);

				market = await ethers.getContract('Market');
				marketItem = await ethers.getContract('MarketItem');

				weth = chainConfigs.weth
					? chainConfigs.weth
					: await ethers.getContract('MockWETH'); //TODO:

				marketFee = await market.getListingPrice();
				auctionPrice = ethers.utils.parseUnits('1', 'ether');
			});

			describe('validation', () => {
				const auctionValidationRuns = [
					{
						from: now(),
						duration: toSeconds(10, 'minutes'),
						wait: toSeconds(1, 'minutes'),
						valid: true,
						case: 'Bid within auction period',
					},
					{
						from: now(),
						duration: toSeconds(20, 'minutes'),
						wait:
							toSeconds(15, 'minutes') + toSeconds(59, 'seconds'),
						valid: true,
						case: 'Bid within auction period',
					},
					{
						from: now() + toSeconds(10, 'minutes'),
						duration: toSeconds(10, 'minutes'),
						wait: toSeconds(9, 'minutes'),
						valid: false,
						case: 'Bid before auction started',
					},
					{
						from: now(),
						duration: toSeconds(10, 'minutes'),
						wait: toSeconds(11, 'minutes'),
						valid: false,
						case: 'Bid after auction finished',
					},
				];
				auctionValidationRuns.forEach((run, index) => {
					it('auction validation_' + run.case, async () => {
						const { tokenId, auctionId } = await mintAndAuction(
							'x',
							seller,
							run.duration
						);

						await networkDelay(run.wait);
						await weth
							.connect(buyer)
							.approve(
								market.address,
								ethers.constants.MaxUint256
							);
						try {
							await callAndWait(market, 'bid', {
								args: [auctionId],
								from: buyer,
								value: auctionPrice,
							});
							assert(true === run.valid, run.case);
						} catch (e) {
							assert(false === run.valid, run.case + e.message);
						}
					});
				});
			});

			it('auction for non existing nft should be reverted', async () => {
				await expect(
					callAndWait(market, 'auction', {
						args: [
							marketItem.address,
							1,
							auctionPrice,
							now(),
							toSeconds(1, 'days'),
						],
						from: seller,
						value: marketFee,
					})
				).to.be.revertedWith('ERC721: invalid token ID');
			});

			it('auction listing take only === listingPrice', async () => {
				await callAndWait(marketItem, 'createToken', {
					args: ['X'],
					from: seller,
				});
				await expect(
					callAndWait(market, 'auction', {
						args: [
							marketItem.address,
							1,
							auctionPrice,
							now(),
							toSeconds(1, 'days'),
						],
						from: seller,
						value: marketFee.mul(2),
					})
				).to.be.revertedWithCustomError(market, 'Market__WrongFee');
			});

			it('auction fee correct calculated', async () => {
				const sellerBalanceBefore = await ethers.provider.getBalance(
					seller.address
				);
				const createdNftReceipt = await callAndWait(
					marketItem,
					'createToken',
					{
						args: ['X'],
						from: seller,
					}
				);

				const createdAuctionReceipt = await callAndWait(
					market,
					'auction',
					{
						args: [
							marketItem.address,
							1,
							auctionPrice,
							now(),
							toSeconds(10, 'minutes'),
						],
						from: seller,
						value: marketFee,
					}
				);
				const spentGasOnMint = gasCost(createdNftReceipt);
				const spentGasOnAuction = gasCost(createdAuctionReceipt);
				const sellerBalanceAfter = await ethers.provider.getBalance(
					seller.address
				);

				assert(
					sellerBalanceAfter.eq(
						sellerBalanceBefore
							.sub(spentGasOnMint)
							.sub(spentGasOnAuction)
							.sub(marketFee)
					)
				);
			});

			it('few auctions should be created', async () => {
				const token1 = await mintAndAuction('x', seller);
				const token2 = await mintAndAuction('x', seller);

				const unsoldItems = await market.fetchUnsoldAuctions();

				const bidsIsEmpty = unsoldItems.every(
					(item) =>
						item.bestBid.owner === ethers.constants.AddressZero &&
						item.bestBid.value.eq(0)
				);

				const sellerIsAuctionCreator = unsoldItems.every(
					(item) => item.seller === seller.address
				);
				const isDurationOkay = unsoldItems.every(
					(item) => item.duration === toSeconds(10, 'minutes')
				);
				const isCorrectNftAddress = unsoldItems.every(
					(item) => item.nftContract === marketItem.address
				);
				assert(
					unsoldItems.length === 2,
					'auction length not as expected'
				);
				assert(
					bidsIsEmpty === true,
					'owner of new auction !== zeroaddress'
				);
				assert(
					sellerIsAuctionCreator === true,
					'wrong seller of auctions'
				);
				assert(isDurationOkay === true, 'wrong duration of auctions');
				assert(
					isCorrectNftAddress === true,
					'wrong nft address of auctions'
				);
			});

			it('signer without weth trying to bid and have reverted', async () => {
				const createdNftReceipt = await callAndWait(
					marketItem,
					'createToken',
					{
						args: ['https://www.mytokenlocation.com'],
						from: seller,
					}
				);

				const tokenId = getEvent(
					createdNftReceipt,
					'Minted',
					(event) => event.args.tokenId
				);
				const sellerAuctionReceipt = await callAndWait(
					market,
					'auction',
					{
						args: [
							marketItem.address,
							tokenId,
							auctionPrice,
							now(),
							toSeconds(20, 'seconds'),
						],
						from: seller,
						value: marketFee.toString(),
					}
				);
				const auctionId = getEvent(
					sellerAuctionReceipt,
					'AuctionCreated',
					(event) => event.args.auctionId
				);
				expect(
					callAndWait(market, 'bid', {
						args: [auctionId],
						from: buyerWithoutWeth, //why buyerwithout weth can approve tx?
						value: auctionPrice,
					})
				).to.be.revertedWithCustomError(
					market,
					'Market__LowBalanceToBid'
				);
			});

			it('auciton with 2 bidders should end as expected', async () => {
				const sellerBalanceBeforeWeth = await weth.balanceOf(
					seller.address
				);
				const buyerBalanceBeforeWeth = await weth.balanceOf(
					buyer.address
				);

				const auctionDuration = toSeconds(10, 'minutes');
				const { tokenId, auctionId } = await mintAndAuction(
					'',
					seller,
					auctionDuration
				);

				const winValue = auctionPrice.mul(3);

				await weth
					.connect(buyer)
					.approve(market.address, ethers.constants.MaxUint256);
				await weth
					.connect(buyer2)
					.approve(market.address, ethers.constants.MaxUint256);

				await callAndWait(market, 'bid', {
					args: [auctionId],
					from: buyer,
					value: auctionPrice,
				});

				await callAndWait(market, 'bid', {
					args: [auctionId],
					from: buyer2,
					value: auctionPrice.mul(2),
				});

				await callAndWait(market, 'bid', {
					args: [auctionId],
					from: buyer,
					value: winValue,
				});

				const auctionBefore = await market.fetchAuction(auctionId);
				await networkDelay(auctionDuration);

				await callAndWait(market, 'claimNFT', {
					args: [auctionId],
					from: buyer,
				});
				const auctionAfter = await market.fetchAuction(auctionId);

				const sellerBalanceAfterWeth = await weth.balanceOf(
					seller.address
				);
				const buyerBalanceAfterWeth = await weth.balanceOf(
					buyer.address
				);
				const buyerNftBalance = await marketItem.balanceOf(
					buyer.address
				);
				const sellerNftBalance = await marketItem.balanceOf(
					seller.address
				);
				const marketplaceNftBalance = await marketItem.balanceOf(
					market.address
				);

				assert(
					sellerBalanceBeforeWeth
						.add(winValue)
						.eq(sellerBalanceAfterWeth),
					'weth seller balance'
				);

				assert(
					buyerBalanceBeforeWeth
						.sub(winValue)
						.eq(buyerBalanceAfterWeth),
					'weth buyer balance'
				);

				// Ensure that the balances and auction state are updated correctly
				assert(
					marketplaceNftBalance.eq(0),
					'Marketplace NFT balance not updated correctly'
				);
				assert(
					sellerNftBalance.eq(0),
					'Seller NFT balance not updated correctly'
				);
				assert(
					buyerNftBalance.eq(1),
					'Buyer NFT balance not updated correctly'
				);
				assert(
					auctionBefore.bestBid.owner === buyer.address,
					'Auction best bid owner not set correctly before sale'
				);
				assert(
					auctionAfter.bestBid.owner === buyer.address,
					'Auction best bid owner not set correctly after sale'
				);
				assert(
					auctionBefore.tokenId.eq(tokenId),
					'Auction token ID not set correctly before sale'
				);
				assert(
					auctionAfter.tokenId.eq(tokenId),
					'Auction token ID not set correctly after sale'
				);
				assert(
					auctionBefore.sold === false,
					'Auction sold state not set correctly before sale'
				);
				assert(
					auctionAfter.sold === true,
					'Auction sold state not set correctly after sale'
				);
			});

			it('fetch auctions', async () => {
				const auctionsBeforeAuction =
					await market.fetchUnsoldAuctions();

				await mintAndAuction('1', seller);
				await mintAndAuction('2', seller);
				await mintAndAuction('3', signer);

				const auctionsAfter = await market.fetchUnsoldAuctions();

				assert(auctionsBeforeAuction.length === 0);
				assert(auctionsAfter.length === 3);
			});

			// HELPERS
			async function mintAndAuction(
				url,
				signer,
				auctionDuration = toSeconds(10, 'minutes')
			) {
				const createdNftReceipt = await callAndWait(
					marketItem,
					'createToken',
					{
						args: [url],
						from: signer,
					}
				);

				const tokenId = getEvent(
					createdNftReceipt,
					'Minted',
					(event) => event.args.tokenId
				);
				const sellerAuctionReceipt = await callAndWait(
					market,
					'auction',
					{
						args: [
							marketItem.address,
							tokenId,
							auctionPrice,
							now() - 10,
							auctionDuration,
						],
						from: signer,
						value: marketFee,
					}
				);
				const auctionId = getEvent(
					sellerAuctionReceipt,
					'AuctionCreated',
					(event) => event.args.auctionId
				);
				return { auctionId: auctionId, tokenId: tokenId };
			}
	  });
