const { assert, expect } = require('chai');
const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config.js');
const { crowdFunding } = require('../../utils/constant.js');
!developmentChains.includes(network.name)
	? describe.skip
	: describe(`${crowdFunding} unit`, async () => {
			let contract, mockV3Aggregator, deployer;
			const valueToFund = ethers.utils.parseEther('1');
			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['mocks', 'crowd']);

				contract = await ethers.getContract(crowdFunding, deployer);
				mockV3Aggregator = await ethers.getContract(
					'MockV3Aggregator',
					deployer
				);
			});
			describe('constructor', () => {
				it('sets feed address correctly', async () => {
					const response = await contract.getPriceFeed();
					assert.equal(response, mockV3Aggregator.address);
				});
			});

			describe('fund', () => {
				it('Fail on small ETH value', async () => {
					await expect(contract.fund()).to.be.revertedWith(
						'Not enough'
					);
				});
				it('update fund', async () => {
					await contract.fund({ value: valueToFund });
					const fundedValue = await contract.getAddressToAmountFunded(
						deployer
					);
					assert.equal(
						fundedValue.toString(),
						valueToFund.toString()
					);
				});

				it('fund and check array', async () => {
					await contract.fund({ value: valueToFund });
					const funder = await contract.getFunder(0);
					assert.equal(funder, deployer);
				});
			});

			describe('withdraw', () => {
				beforeEach(async function () {
					await contract.fund({ value: valueToFund });
				});

				it('withdraw by single funder', async () => {
					const contractBalanceStarted =
						await contract.provider.getBalance(contract.address);
					const deployerBalanceStarted =
						await contract.provider.getBalance(deployer);

					const txResponse = await contract.withdraw();
					const txReceipt = await txResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = txReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);

					const contractBalanceAfter =
						await contract.provider.getBalance(contract.address);
					const deployerBalanceAfter =
						await contract.provider.getBalance(deployer);

					assert.equal(contractBalanceAfter, 0);
					assert.equal(
						contractBalanceStarted
							.add(deployerBalanceStarted)
							.toString(),
						deployerBalanceAfter.add(gasCost).toString()
					);
				});
				it('withdraw by single funder cheaper', async () => {
					const contractBalanceStarted =
						await contract.provider.getBalance(contract.address);
					const deployerBalanceStarted =
						await contract.provider.getBalance(deployer);

					const txResponse = await contract.cheaperWithdraw();
					const txReceipt = await txResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = txReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);

					const contractBalanceAfter =
						await contract.provider.getBalance(contract.address);
					const deployerBalanceAfter =
						await contract.provider.getBalance(deployer);

					assert.equal(contractBalanceAfter, 0);
					assert.equal(
						contractBalanceStarted
							.add(deployerBalanceStarted)
							.toString(),
						deployerBalanceAfter.add(gasCost).toString()
					);
				});

				it('multiple funders + withdraw', async () => {
					const limit = 20;
					const accounts = (await ethers.getSigners()).slice(
						0,
						limit
					);
					for (let i = 1; i < accounts.length; i++) {
						const connectedContract = contract.connect(accounts[i]);
						await connectedContract.fund({ value: valueToFund });
					}
					const contractBalanceStarted =
						await contract.provider.getBalance(contract.address);
					const deployerBalanceStarted =
						await contract.provider.getBalance(deployer);

					const txResponse = await contract.withdraw();
					await txResponse.wait(1);

					await expect(contract.getFunder(0)).to.be.reverted;

					for (let i = 1; i < limit; i++) {
						assert.equal(
							await contract.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});

				it('multiple funders + cheaper withdraw', async () => {
					const limit = 20;
					const accounts = (await ethers.getSigners()).slice(
						0,
						limit
					);
					for (let i = 1; i < accounts.length; i++) {
						const connectedContract = contract.connect(accounts[i]);
						await connectedContract.fund({ value: valueToFund });
					}

					const txResponse = await contract.cheaperWithdraw();
					await txResponse.wait(1);

					await expect(contract.getFunder(0)).to.be.reverted;

					for (let i = 1; i < limit; i++) {
						assert.equal(
							await contract.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});

				it('only owner withdraw', async () => {
					const [owner, addr1] = await ethers.getSigners();
					await expect(contract.connect(addr1).withdraw()).to.be
						.reverted;
				});
			});
	  });
