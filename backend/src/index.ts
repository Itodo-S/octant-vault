import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import { routes } from './routes'
import { eventIndexer } from './services/eventIndexer'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
	credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use(process.env.API_PREFIX || '/api/v1', routes)

// Error handling
app.use(errorHandler)

// Start server
async function startServer() {
	try {
		// Connect to MongoDB
		await connectDatabase()
		console.log('✅ Connected to MongoDB')

		// Start event indexer
		await eventIndexer.start()
		console.log('✅ Event indexer started')

		// Start Express server
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`)
			console.log(`📡 API available at http://localhost:${PORT}${process.env.API_PREFIX || '/api/v1'}`)
		})
	} catch (error) {
		console.error('❌ Failed to start server:', error)
		process.exit(1)
	}
}

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('SIGTERM received, shutting down gracefully...')
	await eventIndexer.stop()
	process.exit(0)
})

startServer()

