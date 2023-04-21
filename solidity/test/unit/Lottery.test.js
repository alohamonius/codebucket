const { assert, expect } = require('chai');
const { deployments, network, ethers, getNamedAccounts } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../../helper-hardhat-config.js');
!developmentChains.includes(network.name)
	? describe.skip
	: describe('Lottery', async () => {
			let lottery,
				vrfCoordinatorMock,
				deployer,
				lotteryEntrenceFee,
				signers,
				interval;
			const chainId = network.config.chainId;
			const valueToPlay = ethers.utils.parseEther('0.02');
			const lowValue = ethers.utils.parseEther('0.001');

			beforeEach(async function () {
				signers = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['mocks', 'lottery']);

				lottery = await ethers.getContract('Lottery', deployer);
				lotteryEntrenceFee = await lottery.getEntrenceFee();
				interval = await lottery.getInterval();
				vrfCoordinatorMock = await ethers.getContract(
					'VRFCoordinatorV2Mock',
					deployer
				);
			});

			describe('constructor', async () => {
				it('contract created as expected', async () => {
					const state = await lottery.getLotteryState();
					const playersLength = await lottery.getNumberOfPlayers();
					const interval = await lottery.getInterval();
					const recentWinner = await lottery.getRecentWinner();

					assert(state.toString() === '0', 'State not correct');

					assert(
						recentWinner === ethers.constants.AddressZero,
						'Recent winner not correct'
					);
					assert(playersLength.toString() === '0', 'Players data not correct');
					assert(
						interval.toString() === networkConfig[chainId].lottery.interval,
						'Interval not correct'
					);
				});
			});

			describe('enter value to play', async () => {
				it('one enter - one player', async () => {
					const signer = signers[2];
					await lottery.connect(signer).enter({ value: valueToPlay });

					const playerAddress = await lottery.getPlayer(0);
					const playersCount = await lottery.getNumberOfPlayers();
					const lotteryBalance = await ethers.provider.getBalance(lottery.address);

					assert(playerAddress === signer.address, 'Created wrong player');
					assert(
						lotteryBalance.toString() === valueToPlay.toString(),
						'Wrong end contract balance'
					);
					assert(playersCount.toString() === '1', 'Wrong players calculation');
				});
				it('enter too low value', async () => {
					await expect(
						lottery.enter({ value: lowValue })
					).to.be.revertedWithCustomError(lottery, 'Lottery__NotEnoughEthEntered');
				});
				it('emit on enter', async () => {
					await expect(lottery.enter({ value: valueToPlay })).to.emit(
						lottery,
						'LotteryEntered'
					);
				});
				it('fail on calculating enter', async () => {
					const signer = signers[3];
					await lottery.connect(signer).enter({ value: valueToPlay });
					await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);

					await lottery.performUpkeep([]);

					await expect(
						lottery.connect(signer).enter({ value: valueToPlay })
					).to.be.revertedWithCustomError(lottery, 'Lottery__NotOpen');
				});
			});

			describe('automation keeper', async () => {
				it('perform upkeep on empty contract revertedWith_UpkeepNotNeeded', async () => {
					await expect(lottery.performUpkeep([]))
						.to.be.revertedWithCustomError(lottery, 'Lottery__UpkeepNotNeeded')
						.withArgs(ethers.constants.Zero, 0, 0);
				});
				it('perform upkeep with player, bad interval revertedWith_UpkeepNotNeeded', async () => {
					const signer = signers[3];
					await lottery.connect(signer).enter({ value: valueToPlay });
					await expect(lottery.performUpkeep([]))
						.to.be.revertedWithCustomError(lottery, 'Lottery__UpkeepNotNeeded')
						.withArgs(valueToPlay, 1, 0);
				});

				it('perform upkeep with suite environment shout emit LotteryRequestedWinner', async () => {
					const signer = signers[3];
					await lottery.connect(signer).enter({ value: valueToPlay });
					await network.provider.send('evm_increaseTime', [interval.toNumber() - 1]);
					await expect(lottery.performUpkeep([])).to.emit(
						lottery,
						'LotteryRequestedWinner'
					);
				});
			});
	  });
