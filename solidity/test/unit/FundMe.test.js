// const { assert, expect } = require("chai")
// const { deployments, ethers, getNamedAccounts } = require("hardhat")
// const { developmentChains } = require("../../helper-hardhat-config.js")
// !developmentChains.includes(network.name)
//     ? describe.skip
//     : describe("FundMe", async () => {
//           let fundMe, mockV3Aggregator, deployer
//           const valueToFund = ethers.utils.parseEther("1")
//           beforeEach(async function () {
//               const [owner, addr1] = await ethers.getSigners()
//               deployer = (await getNamedAccounts()).deployer
//               await deployments.fixture(["all"])

//               fundMe = await ethers.getContract("FundMe", deployer)
//               mockV3Aggregator = await ethers.getContract(
//                   "MockV3Aggregator",
//                   deployer
//               )
//           })
//           describe("constructor", () => {
//               it("sets feed address correctly", async () => {
//                   const response = await fundMe.getPriceFeed()
//                   assert.equal(response, mockV3Aggregator.address)
//                   //   INITIAL_AMSWER
//               })
//           })

//           describe("fund", () => {
//               it("Fail on small ETH value", async () => {
//                   await expect(fundMe.fund()).to.be.revertedWith("Not enough")
//               })
//               it("update fund", async () => {
//                   await fundMe.fund({ value: valueToFund })
//                   const fundedValue = await fundMe.getAddressToAmountFunded(
//                       deployer
//                   )
//                   assert.equal(fundedValue.toString(), valueToFund.toString())
//               })

//               it("fund and check array", async () => {
//                   await fundMe.fund({ value: valueToFund })
//                   const funder = await fundMe.getFunder(0)
//                   assert.equal(funder, deployer)
//               })
//           })

//           describe("withdraw", () => {
//               beforeEach(async function () {
//                   await fundMe.fund({ value: valueToFund })
//               })

//               it("withdraw by single funder", async () => {
//                   const contractBalanceStarted =
//                       await fundMe.provider.getBalance(fundMe.address)
//                   const deployerBalanceStarted =
//                       await fundMe.provider.getBalance(deployer)

//                   const txResponse = await fundMe.withdraw()
//                   const txReceipt = await txResponse.wait(1)
//                   const { gasUsed, effectiveGasPrice } = txReceipt
//                   const gasCost = gasUsed.mul(effectiveGasPrice)

//                   const contractBalanceAfter = await fundMe.provider.getBalance(
//                       fundMe.address
//                   )
//                   const deployerBalanceAfter = await fundMe.provider.getBalance(
//                       deployer
//                   )

//                   assert.equal(contractBalanceAfter, 0)
//                   assert.equal(
//                       contractBalanceStarted
//                           .add(deployerBalanceStarted)
//                           .toString(),
//                       deployerBalanceAfter.add(gasCost).toString()
//                   )
//               })
//               it("withdraw by single funder cheaper", async () => {
//                   const contractBalanceStarted =
//                       await fundMe.provider.getBalance(fundMe.address)
//                   const deployerBalanceStarted =
//                       await fundMe.provider.getBalance(deployer)

//                   const txResponse = await fundMe.cheaperWithdraw()
//                   const txReceipt = await txResponse.wait(1)
//                   const { gasUsed, effectiveGasPrice } = txReceipt
//                   const gasCost = gasUsed.mul(effectiveGasPrice)

//                   const contractBalanceAfter = await fundMe.provider.getBalance(
//                       fundMe.address
//                   )
//                   const deployerBalanceAfter = await fundMe.provider.getBalance(
//                       deployer
//                   )

//                   assert.equal(contractBalanceAfter, 0)
//                   assert.equal(
//                       contractBalanceStarted
//                           .add(deployerBalanceStarted)
//                           .toString(),
//                       deployerBalanceAfter.add(gasCost).toString()
//                   )
//               })

//               it("multiple funders + withdraw", async () => {
//                   const limit = 20
//                   const accounts = (await ethers.getSigners()).slice(0, limit)
//                   for (let i = 1; i < accounts.length; i++) {
//                       const connectedContract = fundMe.connect(accounts[i])
//                       await connectedContract.fund({ value: valueToFund })
//                   }
//                   const contractBalanceStarted =
//                       await fundMe.provider.getBalance(fundMe.address)
//                   const deployerBalanceStarted =
//                       await fundMe.provider.getBalance(deployer)

//                   const txResponse = await fundMe.withdraw()
//                   await txResponse.wait(1)

//                   await expect(fundMe.getFunder(0)).to.be.reverted

//                   for (let i = 1; i < limit; i++) {
//                       assert.equal(
//                           await fundMe.getAddressToAmountFunded(
//                               accounts[i].address
//                           ),
//                           0
//                       )
//                   }
//               })

//               it("multiple funders + cheaper withdraw", async () => {
//                   const limit = 20
//                   const accounts = (await ethers.getSigners()).slice(0, limit)
//                   for (let i = 1; i < accounts.length; i++) {
//                       const connectedContract = fundMe.connect(accounts[i])
//                       await connectedContract.fund({ value: valueToFund })
//                   }

//                   const txResponse = await fundMe.cheaperWithdraw()
//                   await txResponse.wait(1)

//                   await expect(fundMe.getFunder(0)).to.be.reverted

//                   for (let i = 1; i < limit; i++) {
//                       assert.equal(
//                           await fundMe.getAddressToAmountFunded(
//                               accounts[i].address
//                           ),
//                           0
//                       )
//                   }
//               })

//               it("only owner withdraw", async () => {
//                   const [owner, addr1] = await ethers.getSigners()
//                   await expect(fundMe.connect(addr1).withdraw()).to.be.reverted
//               })
//           })
//       })
