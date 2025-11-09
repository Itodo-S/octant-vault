// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title QuadraticVoting
 * @notice Quadratic voting system for contributor nominations
 * @dev Voting cost = n² where n is the number of votes cast
 */
contract QuadraticVoting is Ownable, ReentrancyGuard {
	/// @notice Voting period information
	struct VotingPeriod {
		address vault;
		address nominee;
		string nomineeName;
		string role;
		string description;
		uint256 startTime;
		uint256 endTime;
		uint256 votesFor;
		uint256 votesAgainst;
		uint256 totalVotes;
		bool isActive;
		bool isApproved;
	}

	/// @notice Vote information
	struct Vote {
		address voter;
		uint256 votes;
		bool isFor;
		uint256 timestamp;
	}

	/// @notice Mapping from voting ID to voting period
	mapping(uint256 => VotingPeriod) public votings;

	/// @notice Mapping from voting ID to array of votes
	mapping(uint256 => Vote[]) public votes;

	/// @notice Mapping from voting ID to voter address to vote info
	mapping(uint256 => mapping(address => Vote)) public userVotes;

	/// @notice Mapping from voting ID to total voting credits spent
	mapping(uint256 => uint256) public totalCreditsSpent;

	/// @notice Array of all voting IDs
	uint256[] public votingIds;

	/// @notice Current voting ID counter
	uint256 public nextVotingId;

	/// @notice Voting credit token (can be ERC20 or native token)
	address public creditToken;

	/// @notice Events
	event VotingCreated(
		uint256 indexed votingId,
		address indexed vault,
		address indexed nominee,
		string nomineeName,
		uint256 endTime
	);
	event VoteCast(uint256 indexed votingId, address indexed voter, uint256 votes, bool isFor, uint256 cost);
	event VotingEnded(uint256 indexed votingId, bool approved, uint256 votesFor, uint256 votesAgainst);

	/**
	 * @notice Initialize the voting contract
	 * @param owner Owner address
	 * @param token Credit token address (address(0) for native token)
	 */
	constructor(address owner, address token) Ownable(owner) {
		creditToken = token;
		nextVotingId = 1;
	}

	/**
	 * @notice Create a new voting period
	 * @param vault Vault address
	 * @param nominee Nominee wallet address
	 * @param nomineeName Nominee name
	 * @param role Nominee role
	 * @param description Voting description
	 * @param duration Voting duration in seconds
	 * @return votingId The created voting ID
	 */
	function createVoting(
		address vault,
		address nominee,
		string memory nomineeName,
		string memory role,
		string memory description,
		uint256 duration
	) external onlyOwner returns (uint256 votingId) {
		require(vault != address(0), 'QuadraticVoting: invalid vault');
		require(nominee != address(0), 'QuadraticVoting: invalid nominee');
		require(bytes(nomineeName).length > 0, 'QuadraticVoting: name required');
		require(duration > 0, 'QuadraticVoting: duration must be > 0');

		votingId = nextVotingId++;
		uint256 startTime = block.timestamp;
		uint256 endTime = startTime + duration;

		votings[votingId] = VotingPeriod({
			vault: vault,
			nominee: nominee,
			nomineeName: nomineeName,
			role: role,
			description: description,
			startTime: startTime,
			endTime: endTime,
			votesFor: 0,
			votesAgainst: 0,
			totalVotes: 0,
			isActive: true,
			isApproved: false
		});

		votingIds.push(votingId);

		emit VotingCreated(votingId, vault, nominee, nomineeName, endTime);

		return votingId;
	}

	/**
	 * @notice Cast a vote (quadratic cost)
	 * @param votingId Voting ID
	 * @param voteCount Number of votes to cast
	 * @param isFor True for vote for, false for vote against
	 */
	function vote(uint256 votingId, uint256 voteCount, bool isFor) external payable nonReentrant {
		VotingPeriod storage voting = votings[votingId];
		require(voting.isActive, 'QuadraticVoting: voting not active');
		require(block.timestamp >= voting.startTime, 'QuadraticVoting: voting not started');
		require(block.timestamp < voting.endTime, 'QuadraticVoting: voting ended');
		require(voteCount > 0, 'QuadraticVoting: votes must be > 0');
		require(voteCount <= 10, 'QuadraticVoting: max 10 votes per user');

		// Calculate quadratic cost: cost = votes²
		uint256 cost = voteCount * voteCount;

		// Check if user already voted
		Vote memory existingVote = userVotes[votingId][msg.sender];
		if (existingVote.votes > 0) {
			// Refund previous cost
			uint256 previousCost = existingVote.votes * existingVote.votes;
			cost = cost > previousCost ? cost - previousCost : 0;
		}

		// Handle payment (simplified - in production, use proper ERC20 or native token handling)
		if (creditToken == address(0)) {
			require(msg.value >= cost, 'QuadraticVoting: insufficient payment');
		} else {
			// ERC20 transfer would go here
			// For now, we'll track credits without actual transfer
		}

		// Update voting totals
		if (existingVote.votes > 0) {
			// Remove previous vote
			if (existingVote.isFor) {
				voting.votesFor -= existingVote.votes;
			} else {
				voting.votesAgainst -= existingVote.votes;
			}
			voting.totalVotes -= existingVote.votes;
		}

		// Add new vote
		if (isFor) {
			voting.votesFor += voteCount;
		} else {
			voting.votesAgainst += voteCount;
		}
		voting.totalVotes += voteCount;

		// Store vote
		Vote memory newVote = Vote({
			voter: msg.sender,
			votes: voteCount,
			isFor: isFor,
			timestamp: block.timestamp
		});

		userVotes[votingId][msg.sender] = newVote;
		votes[votingId].push(newVote);
		totalCreditsSpent[votingId] += cost;

		emit VoteCast(votingId, msg.sender, voteCount, isFor, cost);
	}

	/**
	 * @notice End a voting period and determine result
	 * @param votingId Voting ID
	 */
	function endVoting(uint256 votingId) external {
		VotingPeriod storage voting = votings[votingId];
		require(voting.isActive, 'QuadraticVoting: voting not active');
		require(block.timestamp >= voting.endTime, 'QuadraticVoting: voting not ended');

		voting.isActive = false;
		voting.isApproved = voting.votesFor > voting.votesAgainst;

		emit VotingEnded(votingId, voting.isApproved, voting.votesFor, voting.votesAgainst);
	}

	/**
	 * @notice Get voting information
	 * @param votingId Voting ID
	 * @return voting Voting period struct
	 */
	function getVoting(uint256 votingId) external view returns (VotingPeriod memory voting) {
		return votings[votingId];
	}

	/**
	 * @notice Get user's vote for a voting
	 * @param votingId Voting ID
	 * @param voter Voter address
	 * @return userVote Vote struct
	 */
	function getUserVote(uint256 votingId, address voter) external view returns (Vote memory userVote) {
		return userVotes[votingId][voter];
	}

	/**
	 * @notice Get all votes for a voting
	 * @param votingId Voting ID
	 * @return voteList Array of votes
	 */
	function getVotes(uint256 votingId) external view returns (Vote[] memory voteList) {
		return votes[votingId];
	}

	/**
	 * @notice Get all voting IDs
	 * @return ids Array of voting IDs
	 */
	function getAllVotingIds() external view returns (uint256[] memory ids) {
		return votingIds;
	}

	/**
	 * @notice Calculate vote cost (quadratic)
	 * @param voteCount Number of votes
	 * @return cost Cost in credits
	 */
	function calculateVoteCost(uint256 voteCount) external pure returns (uint256 cost) {
		return voteCount * voteCount;
	}
}

