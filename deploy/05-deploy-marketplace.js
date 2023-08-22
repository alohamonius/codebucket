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

		const weth = await ethers.getContract('MockWETH');
		await weth
			.connect(owner)
			.transfer(addr1.address, ethers.utils.parseEther('10'));
		await weth
			.connect(owner)
			.transfer(addr2.address, ethers.utils.parseEther('10'));
		await weth
			.connect(owner)
			.transfer(addr3.address, ethers.utils.parseEther('10'));
		const receipt = await weth
			.connect(owner)
			.transfer(addr4.address, ethers.utils.parseEther('10'));
		receipt.wait(1);
		const market = await deploy('Market', {
			contract: 'Market',
			from: deployer,
			log: true,
			args: [weth.address],
		});
		await deploy('MarketItem', {
			contract: 'MarketItem',
			from: deployer,
			log: true,
			args: [market.address],
		});
		log(formatText(DEPLOY_NAME + ' DONE'));
	} else {
		const { weth } = networkConfig[network.config.chainId].nftmarketplace;

		const market = await deploy('Market', {
			contract: 'Market',
			from: deployer,
			log: true,
			args: [weth],
		});
		await deploy('MarketItem', {
			contract: 'MarketItem',
			from: deployer,
			log: true,
			args: [market.address],
		});
		log(formatText(DEPLOY_NAME + ' SKIPPED'));
	}
};

module.exports.tags = ['all', 'nftmarketplace'];
