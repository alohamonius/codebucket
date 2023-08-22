// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CubePoints is ERC721URIStorage, Ownable {
    struct Point {
        uint256 x;
        uint256 y;
        uint256 z;
    }

    uint256 public nextTokenId;
    uint256 public constant MAX_COORDINATE = 100;

    mapping(uint256 => Point) private _points;

    constructor() ERC721("CubePoints", "CP") {
        nextTokenId = 1;
    }

    function mint(
        uint256 x,
        uint256 y,
        uint256 z,
        string memory tokenURI
    ) external {
        require(x <= MAX_COORDINATE, "Invalid x coordinate");
        require(y <= MAX_COORDINATE, "Invalid y coordinate");
        require(z <= MAX_COORDINATE, "Invalid z coordinate");

        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        Point memory point = Point(x, y, z);
        _points[tokenId] = point;

        nextTokenId++;
    }

    function getPoint(
        uint256 tokenId
    ) public view returns (uint256 x, uint256 y, uint256 z) {
        require(_exists(tokenId), "Token does not exist");

        Point memory point = _points[tokenId];
        return (point.x, point.y, point.z);
    }

    function updateMetadata(
        uint256 tokenId,
        string memory tokenURI
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, tokenURI);
    }
}
