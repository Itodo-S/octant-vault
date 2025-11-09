import mongoose, { Schema, Document } from 'mongoose'

export interface IVoting extends Document {
	votingId: number
	vault: string
	nominee: string
	nomineeName: string
	description: string
	startTime: Date
	endTime: Date
	votesFor: number
	votesAgainst: number
	totalVotes: number
	isActive: boolean
	isApproved: boolean | null
	createdAt: Date
	updatedAt: Date
}

const VotingSchema = new Schema<IVoting>(
	{
		votingId: {
			type: Number,
			required: true,
			unique: true,
			index: true,
		},
		vault: {
			type: String,
			required: true,
			index: true,
		},
		nominee: {
			type: String,
			required: true,
		},
		nomineeName: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
		votesFor: {
			type: Number,
			default: 0,
		},
		votesAgainst: {
			type: Number,
			default: 0,
		},
		totalVotes: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isApproved: {
			type: Boolean,
			default: null,
		},
	},
	{
		timestamps: true,
	}
)

export const Voting = mongoose.model<IVoting>('Voting', VotingSchema)

