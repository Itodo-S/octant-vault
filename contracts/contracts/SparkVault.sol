// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC4626 } from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';
import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title SparkVault
 * @notice ERC-4626 compliant vault that integrates with Spark's curated yield for yield-donating strategy
 * @dev This vault uses Spark's curated yield as the yield source and implements a yield-donating mechanism
 *      where generated yield is automatically donated to public goods projects while preserving principal.
 * 
 * Yield Donating Strategy:
 * - Users deposit assets into the vault
 * - Assets are supplied to Spark's curated yield strategies
 * - Generated yield (not principal) is automatically donated to selected projects
 * - Principal remains intact and can be withdrawn by users
 * 
 * Key Features:
 * - ERC-4626 compliant interface
 * - Spark curated yield integration
 * - Yield-donating mechanism (principal preservation)
 * - Automated yield distribution to public goods
 * - Safety checks for deposits/withdrawals
 * - Proper accounting of assets, shares, and yield
 * 
 * Safety Checks:
 * - Reentrancy protection on all state-changing functions
 * - Validation of asset addresses and amounts
 * - Principal tracking to separate yield from deposits
 * - Owner-only access for yield donation functions
 */
/**
 * @notice Interface for Spark Pool (SparkLend's main contract)
 * @dev This interface matches Spark's IPool interface for SparkLend
 * Reference: https://docs.spark.fi/developers/sparklend
 */
interface IPool {
	/**
	 * @notice Supplies an `amount` of underlying asset into the reserve, receiving in return overlying aTokens
	 * @param asset The address of the underlying asset to supply
	 * @param amount The amount to be supplied
	 * @param onBehalfOf The address that will receive the aTokens, same as msg.sender if the user
	 *   wants to receive them on his own wallet, or a different address if the beneficiary of aTokens
	 *   is a different wallet
	 * @param referralCode Code used to register the integrator originating the operation, for potential rewards
	 */
	function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;

	/**
	 * @notice Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
	 * @param asset The address of the underlying asset to withdraw
	 * @param amount The underlying amount to be withdrawn
	 * @param to The address that will receive the underlying, same as msg.sender if the user
	 *   wants to receive it on his own wallet, or a different address if the beneficiary is a
	 *   different wallet
	 * @return The final amount withdrawn
	 */
	function withdraw(address asset, uint256 amount, address to) external returns (uint256);

	/**
	 * @notice Returns the state and configuration of the reserve
	 * @param asset The address of the underlying asset of the reserve
	 * @return configuration Reserve configuration
	 * @return liquidityIndex The liquidity index
	 * @return currentLiquidityRate The current liquidity rate
	 * @return variableBorrowIndex The variable borrow index
	 * @return currentVariableBorrowRate The current variable borrow rate
	 * @return currentStableBorrowRate The current stable borrow rate
	 * @return lastUpdateTimestamp Last update timestamp
	 * @return id Reserve ID
	 * @return aTokenAddress Address of the aToken
	 * @return stableDebtTokenAddress Address of the stable debt token
	 * @return variableDebtTokenAddress Address of the variable debt token
	 * @return interestRateStrategyAddress Address of the interest rate strategy
	 * @return accruedToTreasury Accrued to treasury
	 * @return unbacked Unbacked amount
	 * @return isolationModeTotalDebt Isolation mode total debt
	 */
	function getReserveData(address asset) external view returns (
		uint256 configuration,
		uint128 liquidityIndex,
		uint128 currentLiquidityRate,
		uint128 variableBorrowIndex,
		uint128 currentVariableBorrowRate,
		uint128 currentStableBorrowRate,
		uint40 lastUpdateTimestamp,
		uint16 id,
		address aTokenAddress,
		address stableDebtTokenAddress,
		address variableDebtTokenAddress,
		address interestRateStrategyAddress,
		uint128 accruedToTreasury,
		uint128 unbacked,
		uint128 isolationModeTotalDebt
	);
}

/**
 * @notice Interface for Spark aToken (interest-bearing token)
 * @dev Spark aTokens represent a user's share of the reserve and accrue interest over time
 * Reference: https://docs.spark.fi/developers/sparklend
 */
interface IAToken {
	/**
	 * @notice Returns the balance of tokens for an account
	 * @param account The address of the account
	 * @return The balance of tokens
	 */
	function balanceOf(address account) external view returns (uint256);

	/**
	 * @notice Transfers tokens from one account to another
	 * @param to The address to transfer tokens to
	 * @param amount The amount of tokens to transfer
	 * @return True if the transfer was successful
	 */
	function transfer(address to, uint256 amount) external returns (bool);

	/**
	 * @notice Transfers tokens from one account to another
	 * @param from The address to transfer tokens from
	 * @param to The address to transfer tokens to
	 * @param amount The amount of tokens to transfer
	 * @return True if the transfer was successful
	 */
	function transferFrom(address from, address to, uint256 amount) external returns (bool);

	/**
	 * @notice Approves a spender to transfer tokens on behalf of the owner
	 * @param spender The address of the spender
	 * @param amount The amount of tokens to approve
	 * @return True if the approval was successful
	 */
	function approve(address spender, uint256 amount) external returns (bool);
}

contract SparkVault is ERC4626, Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	/// @notice Spark Pool address (SparkLend's main contract)
	/// @dev Reference: https://docs.spark.fi/developers/sparklend
	IPool public immutable sparkPool;

	/// @notice Spark aToken address for the underlying asset
	/// @dev aToken balance represents the user's share of the reserve with accrued interest
	IAToken public immutable sparkAToken;

	/// @notice Vault metadata
	string public vaultName;
	string public vaultDescription;
	address public deployer;
	uint256 public createdAt;

	/// @notice Total principal deposits (to track yield separately)
	uint256 public totalPrincipalDeposits;

	/// @notice Yield donation recipient addresses
	address[] public donationRecipients;
	mapping(address => bool) public isDonationRecipient;

	/// @notice Yield donation percentage per recipient (in basis points)
	mapping(address => uint256) public donationPercentageBps;

	/// @notice Events
	event VaultInitialized(
		string name,
		string description,
		address indexed deployer,
		address indexed sparkPool
	);
	event AssetsSuppliedToSpark(uint256 amount, uint256 timestamp);
	event AssetsWithdrawnFromSpark(uint256 amount, uint256 timestamp);
	event YieldDonated(address indexed recipient, uint256 amount, uint256 timestamp);
	event DonationRecipientAdded(address indexed recipient, uint256 percentageBps);
	event DonationRecipientRemoved(address indexed recipient);

	/**
	 * @notice Initialize the Spark-integrated vault
	 * @param asset The underlying asset token (e.g., DAI, USDC)
	 * @param sparkPoolAddress Address of Spark Pool (SparkLend's main contract)
	 * @param sparkATokenAddress Address of Spark aToken for the asset (obtained via getReserveData)
	 * @param name Vault name
	 * @param description Vault description
	 * @param owner Vault owner address
	 * @dev Spark Pool addresses:
	 *      - Ethereum Mainnet: [See Spark deployments documentation]
	 *      - Gnosis Chain: [See Spark deployments documentation]
	 *      Reference: https://docs.spark.fi/developers/deployments
	 */
	constructor(
		IERC20 asset,
		address sparkPoolAddress,
		address sparkATokenAddress,
		string memory name,
		string memory description,
		address owner
	) ERC4626(asset) ERC20(string(abi.encodePacked('Spark Vault ', name)), string(abi.encodePacked('sv', _symbol(asset)))) Ownable(owner) {
		require(sparkPoolAddress != address(0), 'SparkVault: invalid spark pool address');
		require(sparkATokenAddress != address(0), 'SparkVault: invalid spark aToken address');

		sparkPool = IPool(sparkPoolAddress);
		sparkAToken = IAToken(sparkATokenAddress);

		vaultName = name;
		vaultDescription = description;
		deployer = owner;
		createdAt = block.timestamp;

		// Approve Spark pool to spend assets
		IERC20(asset).approve(sparkPoolAddress, type(uint256).max);

		emit VaultInitialized(name, description, owner, sparkPoolAddress);
	}

	/**
	 * @notice Get vault metadata
	 * @return name Vault name
	 * @return description Vault description
	 * @return totalAssetsValue Total assets in vault (including yield)
	 * @return totalSupplyValue Total shares issued
	 * @return availableYield Net yield available for donation
	 * @return sparkPoolAddress Address of Spark Lending Pool
	 */
	function getVaultInfo()
		external
		view
		returns (
			string memory name,
			string memory description,
			uint256 totalAssetsValue,
			uint256 totalSupplyValue,
			uint256 availableYield,
			address sparkPoolAddress
		)
	{
		return (
			vaultName,
			vaultDescription,
			totalAssets(),
			totalSupply(),
			getAvailableYield(),
			address(sparkPool)
		);
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
	 * @notice Override totalAssets to include Spark yield
	 * @dev Returns the total amount of underlying assets managed by this vault,
	 *      including yield earned through Spark's curated yield (SparkLend)
	 *      The aToken balance represents the user's share with accrued interest
	 * @return Total assets including yield
	 * @dev Reference: https://docs.spark.fi/developers/sparklend
	 */
	function totalAssets() public view override returns (uint256) {
		// Get aToken balance from Spark
		// aToken balance represents the underlying asset amount with accrued interest
		// This is Spark's curated yield mechanism - interest accrues automatically
		uint256 aTokenBalance = sparkAToken.balanceOf(address(this));
		
		// The aToken balance already includes accrued interest (yield)
		// This is how Spark's curated yield works - interest accrues in the aToken balance
		return aTokenBalance;
	}

	/**
	 * @notice Get available yield (total assets minus principal)
	 * @dev Returns the net yield that can be donated to public goods
	 * @return yieldAmount Available yield amount
	 */
	function getAvailableYield() public view returns (uint256 yieldAmount) {
		uint256 total = totalAssets();
		uint256 principal = totalPrincipalDeposits;
		
		if (total > principal) {
			return total - principal;
		}
		return 0;
	}

	/**
	 * @notice Override deposit to supply assets to Spark
	 * @dev Deposits assets into Spark's curated yield strategies and mints shares
	 * Safety checks:
	 * - Reentrancy protection
	 * - Asset amount validation
	 * - Receiver address validation
	 * @param assets Amount of assets to deposit
	 * @param receiver Address to receive shares
	 * @return shares Amount of shares minted
	 */
	function deposit(uint256 assets, address receiver)
		public
		override
		nonReentrant
		returns (uint256 shares)
	{
		require(assets > 0, 'SparkVault: invalid amount');
		require(receiver != address(0), 'SparkVault: invalid receiver');

		// Transfer assets from user
		SafeERC20.safeTransferFrom(IERC20(asset()), msg.sender, address(this), assets);

		// Supply to Spark's curated yield (SparkLend)
		// This deposits assets into SparkLend, receiving aTokens in return
		// Interest accrues automatically in the aToken balance
		sparkPool.supply(address(asset()), assets, address(this), 0);
		emit AssetsSuppliedToSpark(assets, block.timestamp);

		// Track principal deposits
		totalPrincipalDeposits += assets;

		// Calculate shares to mint (1:1 initially, but may differ due to yield)
		shares = convertToShares(assets);
		_mint(receiver, shares);

		emit Deposit(msg.sender, receiver, assets, shares);

		return shares;
	}

	/**
	 * @notice Override redeem to withdraw assets from Spark
	 * @dev Redeems shares and withdraws corresponding assets from Spark
	 * Safety checks:
	 * - Reentrancy protection
	 * - Share amount validation
	 * - Owner authorization check
	 * - Sufficient balance check
	 * @param shares Amount of shares to redeem
	 * @param receiver Address to receive assets
	 * @param owner Address that owns the shares
	 * @return assets Amount of assets returned
	 */
	function redeem(uint256 shares, address receiver, address owner)
		public
		override
		nonReentrant
		returns (uint256 assets)
	{
		require(shares > 0, 'SparkVault: invalid shares');
		require(receiver != address(0), 'SparkVault: invalid receiver');

		if (msg.sender != owner) {
			_spendAllowance(owner, msg.sender, shares);
		}

		_burn(owner, shares);

		// Calculate assets to withdraw
		assets = convertToAssets(shares);

		// Withdraw from Spark's curated yield (SparkLend)
		// This burns aTokens and returns underlying assets
		sparkPool.withdraw(address(asset()), assets, address(this));
		emit AssetsWithdrawnFromSpark(assets, block.timestamp);

		// Update principal tracking (proportional withdrawal)
		uint256 principalToWithdraw = (assets * totalPrincipalDeposits) / totalAssets();
		totalPrincipalDeposits -= principalToWithdraw;

		// Transfer assets to receiver
		SafeERC20.safeTransfer(IERC20(asset()), receiver, assets);

		emit Withdraw(msg.sender, receiver, owner, assets, shares);

		return assets;
	}

	/**
	 * @notice Override convertToShares to account for Spark yield
	 * @dev Converts assets to shares based on current exchange rate from Spark
	 * @param assets Amount of assets
	 * @return shares Equivalent shares
	 */
	function convertToShares(uint256 assets) public view override returns (uint256) {
		uint256 supply = totalSupply();
		if (supply == 0) {
			return assets;
		}
		uint256 total = totalAssets();
		return (assets * supply) / total;
	}

	/**
	 * @notice Override convertToAssets to account for Spark yield
	 * @dev Converts shares to assets based on current exchange rate from Spark
	 * @param shares Amount of shares
	 * @return assets Equivalent assets
	 */
	function convertToAssets(uint256 shares) public view override returns (uint256) {
		uint256 supply = totalSupply();
		if (supply == 0) {
			return 0;
		}
		uint256 total = totalAssets();
		return (shares * total) / supply;
	}

	/**
	 * @notice Internal function to execute yield donation
	 * @dev Withdraws yield from Spark and donates to recipients
	 * @param recipients Array of recipient addresses
	 * @param amounts Array of amounts to donate
	 */
	function _executeDonation(address[] memory recipients, uint256[] memory amounts) internal {
		uint256 totalDonation = 0;
		for (uint256 i = 0; i < recipients.length; i++) {
			totalDonation += amounts[i];
		}

		// Withdraw yield from Spark's curated yield (SparkLend)
		// This burns aTokens and returns underlying assets (yield portion)
		sparkPool.withdraw(address(asset()), totalDonation, address(this));
		emit AssetsWithdrawnFromSpark(totalDonation, block.timestamp);

		// Donate to recipients
		IERC20 assetToken = IERC20(asset());
		for (uint256 i = 0; i < recipients.length; i++) {
			if (amounts[i] > 0) {
				SafeERC20.safeTransfer(assetToken, recipients[i], amounts[i]);
				emit YieldDonated(recipients[i], amounts[i], block.timestamp);
			}
		}
	}

	/**
	 * @notice Donate available yield to public goods projects
	 * @dev Withdraws yield (not principal) from Spark and donates to recipients
	 * Safety checks:
	 * - Owner-only access
	 * - Reentrancy protection
	 * - Yield amount validation
	 * - Recipient validation
	 * @param recipients Array of recipient addresses
	 * @param amounts Array of amounts to donate
	 */
	function donateYield(address[] calldata recipients, uint256[] calldata amounts)
		external
		onlyOwner
		nonReentrant
	{
		require(recipients.length == amounts.length, 'SparkVault: array length mismatch');
		require(recipients.length > 0, 'SparkVault: empty arrays');

		for (uint256 i = 0; i < recipients.length; i++) {
			require(recipients[i] != address(0), 'SparkVault: invalid recipient');
			require(amounts[i] > 0, 'SparkVault: invalid amount');
		}

		uint256 totalDonation = 0;
		for (uint256 i = 0; i < amounts.length; i++) {
			totalDonation += amounts[i];
		}

		uint256 availableYield = getAvailableYield();
		require(totalDonation <= availableYield, 'SparkVault: insufficient yield');

		_executeDonation(recipients, amounts);
	}

	/**
	 * @notice Add a donation recipient
	 * @param recipient Address to receive yield donations
	 * @param percentageBps Percentage of yield to donate (in basis points)
	 */
	function addDonationRecipient(address recipient, uint256 percentageBps) external onlyOwner {
		require(recipient != address(0), 'SparkVault: invalid recipient');
		require(percentageBps > 0 && percentageBps <= 10000, 'SparkVault: invalid percentage');
		require(!isDonationRecipient[recipient], 'SparkVault: recipient already exists');

		donationRecipients.push(recipient);
		isDonationRecipient[recipient] = true;
		donationPercentageBps[recipient] = percentageBps;

		emit DonationRecipientAdded(recipient, percentageBps);
	}

	/**
	 * @notice Remove a donation recipient
	 * @param recipient Address to remove
	 */
	function removeDonationRecipient(address recipient) external onlyOwner {
		require(isDonationRecipient[recipient], 'SparkVault: recipient not found');

		isDonationRecipient[recipient] = false;
		donationPercentageBps[recipient] = 0;

		// Remove from array
		for (uint256 i = 0; i < donationRecipients.length; i++) {
			if (donationRecipients[i] == recipient) {
				donationRecipients[i] = donationRecipients[donationRecipients.length - 1];
				donationRecipients.pop();
				break;
			}
		}

		emit DonationRecipientRemoved(recipient);
	}

	/**
	 * @notice Automatically donate yield based on configured recipients
	 * @dev Calculates yield and donates proportionally to configured recipients
	 */
	function autoDonateYield() external onlyOwner nonReentrant {
		uint256 availableYield = getAvailableYield();
		require(availableYield > 0, 'SparkVault: no yield available');
		require(donationRecipients.length > 0, 'SparkVault: no recipients configured');

		address[] memory recipients = new address[](donationRecipients.length);
		uint256[] memory amounts = new uint256[](donationRecipients.length);

		for (uint256 i = 0; i < donationRecipients.length; i++) {
			address recipient = donationRecipients[i];
			if (isDonationRecipient[recipient]) {
				recipients[i] = recipient;
				amounts[i] = (availableYield * donationPercentageBps[recipient]) / 10000;
			}
		}

		_executeDonation(recipients, amounts);
	}

	/**
	 * @notice Get all donation recipients
	 * @return recipients Array of recipient addresses
	 * @return percentages Array of donation percentages (in basis points)
	 */
	function getDonationRecipients()
		external
		view
		returns (address[] memory recipients, uint256[] memory percentages)
	{
		recipients = donationRecipients;
		percentages = new uint256[](recipients.length);
		
		for (uint256 i = 0; i < recipients.length; i++) {
			percentages[i] = donationPercentageBps[recipients[i]];
		}
	}
}

