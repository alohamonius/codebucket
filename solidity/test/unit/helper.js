async function deploy(name, ...params) {
    const Contract = await ethers.getContractFactory(name)
    return await Contract.deploy(...params).then((f) => f.deployed())
}

module.exports = { deploy: deploy }
