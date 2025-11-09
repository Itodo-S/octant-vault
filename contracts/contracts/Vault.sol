// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC4626 } from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';
import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title Vault
 * @notice ERC-4626 compliant vault for yield generation and contributor distribution
 * @dev Extends OpenZeppelin's ERC4626 implementation
 */
contract Vault is ERC4626, Ownable, ReentrancyGuard {
	/// @notice Vault metadata
	string public vaultName;
	string public vaultDescription;
	address public deployer;
	uint256 public createdAt;

	/// @notice Events
	event VaultInitialized(string name, string description, address indexed deployer);
	event YieldGenerated(uint256 amount, uint256 timestamp);
	event DistributionExecuted(address indexed recipient, uint256 amount, uint256 timestamp);

	/**
	 * @notice Initialize the vault
	 * @param asset The underlying asset token (e.g., USDC)
	 * @param name Vault name
	 * @param description Vault description
	 * @param owner Vault owner address
	 */
	constructor(
		IERC20 asset,
		string memory name,
		string memory description,
		address owner
	) ERC4626(asset) ERC20(string(abi.encodePacked('Vault ', name)), string(abi.encodePacked('v', _symbol(asset)))) Ownable(owner) {
		vaultName = name;
		vaultDescription = description;
		deployer = owner;
		createdAt = block.timestamp;

		emit VaultInitialized(name, description, owner);
	}

	/**
	 * @notice Get vault metadata
	 * @return name Vault name
	 * @return description Vault description
	 * @return totalAssetsValue Total assets in vault
	 * @return totalSupplyValue Total shares issued
	 */
	function getVaultInfo() external view returns (string memory name, string memory description, uint256 totalAssetsValue, uint256 totalSupplyValue) {
		return (vaultName, vaultDescription, totalAssets(), totalSupply());
	}

	/**
	 * @notice Internal helper to get asset symbol
	 * @param asset The asset token
	 * @return symbol The asset symbol
	 */
	function _symbol(IERC20 asset) private view returns (string memory) {
		try ERC20(address(asset)).symbol() returns (string memory s) {
			return s;
		} catch {
			return 'ASSET';
		}
	}

	/**
	 * @notice Override deposit to add custom logic if needed
	 * @param assets Amount of assets to deposit
	 * @param receiver Address to receive shares
	 * @return shares Amount of shares minted
	 */
	function deposit(uint256 assets, address receiver) public override nonReentrant returns (uint256 shares) {
		return super.deposit(assets, receiver);
	}

	/**
	 * @notice Override redeem to add custom logic if needed
	 * @param shares Amount of shares to redeem
	 * @param receiver Address to receive assets
	 * @param owner Address that owns the shares
	 * @return assets Amount of assets returned
	 */
	function redeem(uint256 shares, address receiver, address owner) public override nonReentrant returns (uint256 assets) {
		return super.redeem(shares, receiver, owner);
	}

	/**
	 * @notice Distribute assets to a contributor (only owner)
	 * @param recipient Address to receive distribution
	 * @param amount Amount of assets to distribute
	 */
	function distributeToContributor(address recipient, uint256 amount) external onlyOwner nonReentrant {
		require(recipient != address(0), 'Vault: invalid recipient');
		require(amount > 0, 'Vault: invalid amount');
		require(amount <= totalAssets(), 'Vault: insufficient assets');

		IERC20(asset()).transfer(recipient, amount);

		emit DistributionExecuted(recipient, amount, block.timestamp);
	}

	/**
	 * @notice Batch distribute assets to multiple contributors
	 * @param recipients Array of recipient addresses
	 * @param amounts Array of amounts to distribute
	 */
	function batchDistribute(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner nonReentrant {
		require(recipients.length == amounts.length, 'Vault: array length mismatch');
		require(recipients.length > 0, 'Vault: empty arrays');

		IERC20 assetToken = IERC20(asset());
		uint256 totalAmount = 0;

		for (uint256 i = 0; i < recipients.length; i++) {
			require(recipients[i] != address(0), 'Vault: invalid recipient');
			require(amounts[i] > 0, 'Vault: invalid amount');
			totalAmount += amounts[i];
		}

		require(totalAmount <= totalAssets(), 'Vault: insufficient assets');

		for (uint256 i = 0; i < recipients.length; i++) {
			assetToken.transfer(recipients[i], amounts[i]);
			emit DistributionExecuted(recipients[i], amounts[i], block.timestamp);
		}
	}
}

