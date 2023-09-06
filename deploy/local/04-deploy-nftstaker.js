const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../../helper-hardhat-config');
const DEPLOY_NAME = 'NFT-STAKE-TO-ERC20';
const { formatText } = require('../../utils/helper');

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log(formatText(DEPLOY_NAME + ' STARTED'));
	if (developmentChains.includes(network.name)) {
		const {
			rewardsPeriod,
			rewardsPerPeriod,
			saleStartTime,
			saleMintPrice,
			salePerAccount,
		} = networkConfig[network.config.chainId].nftstaker;
		const minter = await deploy('TokenMinter', {
			contract: 'TokenMinter',
			from: deployer,
			log: true,
			args: [saleStartTime, saleMintPrice, salePerAccount],
		});
		const rewards = await deploy('ERC20Rewards', {
			contract: 'ERC20Rewards',
			from: deployer,
			log: true,
			args: [],
		});
		const staker = await deploy('Staker', {
			contract: 'Staker',
			from: deployer,
			log: true,
			args: [
				minter.address,
				rewards.address,
				rewardsPeriod,
				rewardsPerPeriod,
			],
		});
		const rewardToken = await ethers.getContract('ERC20Rewards', deployer);
		await rewardToken.addController(staker.address);

		log(formatText(DEPLOY_NAME + ' DONE'));
	} else {
		log(formatText(DEPLOY_NAME + ' SKIPPED'));
	}
};

module.exports.tags = ['all', 'nftstaker'];
