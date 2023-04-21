const { assert, expect } = require('chai');
const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config.js');
const { crowdFunding } = require('../../utils/constant.js');

developmentChains.includes(network.name)
	? describe.skip
	: describe(`${crowdFunding} staging`, async () => {
			let contract, deployer;
			const valueToFund = ethers.utils.parseEther('0.1');
			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer;
				contract = await ethers.getContract(crowdFunding, deployer);
			});

			it('allow to fund', async () => {
				const fundTxResponse = await contract.fund({
					value: valueToFund,
				});
				await fundTxResponse.wait(1);
				const withdrawTxResponse = await contract.withdraw();
				await withdrawTxResponse.wait(1);

				const endBalance = await contract.provider.getBalance(
					contract.address
				);

				assert.equal(endBalance.toString(), '0');
			});
	  });
