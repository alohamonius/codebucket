const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
	forkChains,
	goerli,
} = require('../../helper-hardhat-config');
const { verify } = require('../../utils/verify');
const { formatText } = require('../../utils/helper');

const DEPLOY_NAME = 'MyTokenOnDex';

//CODEBUCKET_ENV=dev npx hardhat deploy --tags MyTokenOnDex --network goerli
module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log(formatText(DEPLOY_NAME + ' STARTED'));

	if (developmentChains.includes(network.name)) {
		await deploy('MyTokenOnDex', {
			contract: 'MyTokenOnDex',
			from: deployer,
			log: true,
			args: ['InDexLocal', 'IDX_LC', 50_000_000],
		});
	} else if (goerli === network.name) {
		const decimals = 18;
		const supply = ethers.utils.parseUnits('50000000', decimals);
		const args = ['InDex', 'IDX', supply];
		const contract = await deploy('MyTokenOnDex', {
			contract: 'MyTokenOnDex',
			from: deployer,
			log: true,
			args: args,
			waitConfirmations: network.config.blockConfirmations || 1,
		});

		await verify(contract.address, args);
	}
};

module.exports.tags = ['MyTokenOnDex'];
