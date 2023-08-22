const { ethers, getNamedAccounts } = require("hardhat")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

async function main() {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const StorageTester = await deploy("StorageTester", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(StorageTester.address, [])
    }

    const mappingData = await getMappingData(
        StorageTester.address,
        ["uint256", "uint256"],
        [deployer, 3]
    )
    const arrayData = await getArrayData(
        StorageTester.address,
        ["uint256"],
        [2]
    )

    log("Logging storage...")
    for (let i = 0; i < 10; i++) {
        const storageData = await ethers.provider.getStorageAt(
            StorageTester.address,
            i
        )

        log(`Location ${i}: ${storageData}`)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

async function getMappingData(contractAddress, type, data) {
    let locationMappingData = ethers.BigNumber.from(
        ethers.utils.solidityKeccak256(type, data)
    )
    return ethers.BigNumber.from(
        await ethers.provider.getStorageAt(contractAddress, locationMappingData)
    ).toNumber()
}

async function getArrayData(contractAddress, type, slot) {
    let data = []
    const arrayLength = ethers.BigNumber.from(
        await ethers.provider.getStorageAt(contractAddress, slot[0])
    )

    let arrayLocation = ethers.BigNumber.from(
        ethers.utils.solidityKeccak256(type, slot)
    )

    for (let i = 0; i < arrayLength; i++) {
        const storageData = ethers.BigNumber.from(
            await ethers.provider.getStorageAt(contractAddress, arrayLocation)
        )
        data.push(storageData.toNumber())
        arrayLocation = arrayLocation.add(1)
    }
    return data
}
