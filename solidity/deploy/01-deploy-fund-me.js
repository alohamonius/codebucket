const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId

    const ethUsdPriceFeedAddress = developmentChains.includes(network.name)
        ? (await deployments.get("MockV3Aggregator")).address
        : networkConfig[chainId].fundMe.ethUsdPriceFeed

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("-------FundMe deployed---------")
}

module.exports.tags = ["all", "fundMe"]
