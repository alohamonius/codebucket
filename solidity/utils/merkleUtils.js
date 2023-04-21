const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")
const { ethers } = require("hardhat")

const generateMerkleTree = (whitelistedWallets) => {
    const leafNodes = whitelistedWallets.map((signer) =>
        keccak256(signer.toLowerCase())
    )

    const merkleTree = new MerkleTree(leafNodes, keccak256, {
        sortPairs: true,
    })

    return merkleTree
}

module.exports = { generateMerkleTree: generateMerkleTree }
