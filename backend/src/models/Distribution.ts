import mongoose, { Schema, Document } from 'mongoose'

export interface IDistribution extends Document {
	scheduleId: number
	vault: string
	scheduledTime: Date
	distributionMethod: number
	executed: boolean
	executedAt: Date | null
	totalAmount: string
	recipientCount: number
	createdAt: Date
	updatedAt: Date
}

const DistributionSchema = new Schema<IDistribution>(
	{
		scheduleId: {
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
		scheduledTime: {
			type: Date,
			required: true,
		},
		distributionMethod: {
			type: Number,
			required: true,
		},
		executed: {
			type: Boolean,
			default: false,
		},
		executedAt: {
			type: Date,
			default: null,
		},
		totalAmount: {
			type: String,
			default: '0',
		},
		recipientCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
)

export const Distribution = mongoose.model<IDistribution>('Distribution', DistributionSchema)

