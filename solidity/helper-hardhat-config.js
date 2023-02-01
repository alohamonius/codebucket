const { ethers } = require("hardhat")

const networkConfig = {
    5: {
        name: "Goerli",

        fundMe: {
            ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        },

        lottery: {
            vrfCoordinator: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
            entrenceFee: ethers.utils.parseEther("0.01"),
            gasLane:
                "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
            subscriptionId: "9323",
            callbackGasLimit: "500000",
            interval: "30",
        },
    },
    31337: {
        name: "hardhat",

        lottery: {
            vrfCoordinator: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
            entrenceFee: ethers.utils.parseEther("0.01"),
            gasLane:
                "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
            callbackGasLimit: "500000",
            interval: "5",
        },
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_AMSWER = 1470000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_AMSWER,
}
