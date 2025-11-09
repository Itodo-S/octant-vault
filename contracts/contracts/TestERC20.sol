// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title TestERC20
 * @notice ERC20 token for testing purposes with configurable decimals
 * @dev Can be used to create test tokens like USDC (6 decimals) or DAI (18 decimals)
 */
contract TestERC20 is ERC20 {
	uint8 private _decimals;

	/**
	 * @notice Initialize the token
	 * @param name Token name (e.g., "USD Coin")
	 * @param symbol Token symbol (e.g., "USDC")
	 * @param decimals_ Number of decimals (e.g., 6 for USDC, 18 for DAI)
	 */
	constructor(
		string memory name,
		string memory symbol,
		uint8 decimals_
	) ERC20(name, symbol) {
		_decimals = decimals_;
	}

	/**
	 * @notice Get the number of decimals
	 * @return Number of decimals
	 */
	function decimals() public view virtual override returns (uint8) {
		return _decimals;
	}

	/**
	 * @notice Mint tokens to an address
	 * @param to Address to mint to
	 * @param amount Amount to mint
	 */
	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}

	/**
	 * @notice Burn tokens from an address
	 * @param from Address to burn from
	 * @param amount Amount to burn
	 */
	function burn(address from, uint256 amount) external {
		_burn(from, amount);
	}
}

