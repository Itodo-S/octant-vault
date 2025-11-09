import mongoose, { Schema, Document } from 'mongoose'

export interface IContributor extends Document {
	vault: string
	wallet: string
	name: string
	role: string
	monthlyAllocation: string
	totalEarned: string
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}

const ContributorSchema = new Schema<IContributor>(
	{
		vault: {
			type: String,
			required: true,
			index: true,
		},
		wallet: {
			type: String,
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			required: true,
		},
		monthlyAllocation: {
			type: String,
			default: '0',
		},
		totalEarned: {
			type: String,
			default: '0',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
)

ContributorSchema.index({ vault: 1, wallet: 1 }, { unique: true })

export const Contributor = mongoose.model<IContributor>('Contributor', ContributorSchema)

