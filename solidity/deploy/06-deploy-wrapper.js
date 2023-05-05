const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../helper-hardhat-config');
const { formatText } = require('../utils/helper');

const DEPLOY_NAME = 'NFT-MARKETPLACE';

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log(formatText(DEPLOY_NAME + ' STARTED'));

	if (developmentChains.includes(network.name)) {
		[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

		const market = await deploy('TokenWrapper', {
			contract: 'TokenWrapper',
			from: deployer,
			log: true,
			args: ['nft20', 'nft20'],
		});
	} else {
		// const { weth } = networkConfig[network.config.chainId].nftmarketplace;
		// await deploy('MarketItem', {
		// 	contract: 'MarketItem',
		// 	from: deployer,
		// 	log: true,
		// 	args: [market.address],
		// });
		// log(formatText(DEPLOY_NAME + ' SKIPPED'));
	}
};

module.exports.tags = ['all', 'TokenWrapper'];
