// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error Airdrop__InvalidProof();
error Airdrop__AlreadyClaimed();

/**
 * @title MerkleTree for airdrop of ERC721
 * @author alohamonius
 */
contract Airdrop is ERC721 {
    bytes32 public immutable merkleRoot;

    uint256 private tokenId = 0;
    mapping(address => bool) public claimedWhitelist;

    constructor(
        string memory name,
        string memory symbol,
        bytes32 root
    ) ERC721(name, symbol) {
        merkleRoot = root;
    }

    function whitelistMint(uint256 amount, bytes32[] calldata proof) external {
        if (claimedWhitelist[msg.sender] == true)
            revert Airdrop__AlreadyClaimed();
        if (_verify(_leaf(msg.sender, amount), proof) == false)
            revert Airdrop__InvalidProof();
        _safeMint(msg.sender, tokenId);
        tokenId++;
        claimedWhitelist[msg.sender] = true;
    }

    function claimed(address account) public view returns (bool) {
        return claimedWhitelist[account];
    }

    function _leaf(
        address account,
        uint256 amount
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account, amount));
    }

    function _verify(
        bytes32 leaf,
        bytes32[] memory proof
    ) internal view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
