const { network, ethers } = require('hardhat');
const {
	networkConfig,
	developmentChains,
} = require('../../helper-hardhat-config');
const { verify } = require('../../utils/verify');

const VRF_SUBSCRIPTION_DEFAULT_FUND = ethers.utils.parseEther('1');
module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;

	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();

	const chainId = network.config.chainId;

	let vrfCoordinatorAddress, subscriptionId, coordinatorMock;

	if (developmentChains.includes(network.name)) {
		coordinatorMock = await ethers.getContract('VRFCoordinatorV2Mock');

		const receipt = await (
			await coordinatorMock.createSubscription()
		).wait(1);
		subscriptionId = receipt.events[0].args.subId;
		vrfCoordinatorAddress = coordinatorMock.address;

		await coordinatorMock.fundSubscription(
			subscriptionId,
			VRF_SUBSCRIPTION_DEFAULT_FUND
		);
	} else {
		vrfCoordinatorAddress = networkConfig[chainId].lottery.vrfCoordinator;
		subscriptionId = networkConfig[chainId].lottery.subscriptionId;
	}

	const lotteryArgs = networkConfig[chainId].lottery;

	const args = [
		vrfCoordinatorAddress,
		lotteryArgs.entrenceFee,
		lotteryArgs.gasLane,
		subscriptionId,
		lotteryArgs.callbackGasLimit,
		lotteryArgs.interval,
	];

	const lottery = await deploy('Lottery', {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if (developmentChains.includes(network.name)) {
		await coordinatorMock.addConsumer(subscriptionId, lottery.address);
	}
	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(lottery.address, args);
	}

	log('-------Lottery deployed---------');
};

module.exports.tags = ['all', 'lottery'];
