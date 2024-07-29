//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MockAggregator {
    constructor () {

    }
    function latestRoundData()
        pure
        external
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ){
            return (0, 60_000_000_000, 0, 0, 0);
        }
}