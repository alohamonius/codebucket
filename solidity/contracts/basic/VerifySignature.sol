// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract VerifySignature {
    function getMessageHash(
        string memory _message
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function getSignOfHash(bytes32 _messageHash) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function recover(
        bytes32 _signedMessageHash,
        bytes memory _sign
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _split(_sign);
        return ecrecover(_signedMessageHash, v, r, s);
    }

    function verify(
        string memory _message,
        bytes memory _sign
    ) external view returns (bool) {
        bytes32 messageHash = getMessageHash(_message);
        bytes32 signedMessageHash = getSignOfHash(messageHash);

        return recover(signedMessageHash, _sign) == msg.sender;
    }

    function _split(
        bytes memory _sign
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_sign.length == 65, "Invalid length of signature");
        assembly {
            r := mload(add(_sign, 32))
            s := mload(add(_sign, 64))
            v := byte(0, mload(add(_sign, 96)))
        }
    }
}
