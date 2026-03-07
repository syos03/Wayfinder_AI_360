/**
 * MongoDB Connection & Configuration
 * Using Mongoose for better schema validation
 */

import mongoose from 'mongoose'
import type { Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

// Type for cached connection
interface CachedConnection {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

// Global cache for connection
const getCachedConnection = (): CachedConnection => {
  const globalForMongoose = globalThis as typeof globalThis & {
    mongooseCache?: CachedConnection
  }
  
  if (!globalForMongoose.mongooseCache) {
    globalForMongoose.mongooseCache = { conn: null, promise: null }
  }
  
  return globalForMongoose.mongooseCache
}

let cached = getCachedConnection()

/**
 * Check if connection is ready
 */
function isConnected(): boolean {
  return mongoose.connection.readyState === 1
}

/**
 * Connect to MongoDB with connection pooling and retry logic
 */
export async function connectDB(retries = 3): Promise<Mongoose> {
  cached = getCachedConnection()
  
  // If already connected and ready, return immediately
  if (cached.conn && isConnected()) {
    return cached.conn
  }

  // If connection exists but not ready, wait for it
  if (cached.promise && !cached.conn) {
    try {
      cached.conn = await cached.promise
      if (isConnected()) {
        return cached.conn
      }
    } catch (e) {
      // Connection failed, reset and retry
      cached.promise = null
      cached.conn = null
    }
  }

  // If connection exists but not ready, reset it
  if (cached.conn && !isConnected()) {
    cached.conn = null
    cached.promise = null
  }

  // Create new connection with retry logic
  if (!cached.promise) {
    // Check if connection string is MongoDB Atlas (mongodb+srv://)
    const isAtlas = MONGODB_URI.startsWith('mongodb+srv://')
    
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Retry configuration
      retryWrites: true,
      retryReads: true,
      // Only set SSL explicitly for non-Atlas connections
      // Atlas connections already handle SSL in the connection string
      ...(isAtlas ? {} : {
        ssl: true,
        sslValidate: true,
      }),
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully')
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err)
          // Reset cache on error
          if (err.name === 'MongoNetworkError' || err.name === 'MongoPoolClearedError') {
            const cache = getCachedConnection()
            cache.conn = null
            cache.promise = null
          }
        })

        mongoose.connection.on('disconnected', () => {
          console.warn('⚠️ MongoDB disconnected')
          const cache = getCachedConnection()
          cache.conn = null
          cache.promise = null
        })

        mongoose.connection.on('reconnected', () => {
          console.log('✅ MongoDB reconnected')
        })

        return mongoose
      })
      .catch((error) => {
        cached.promise = null
        console.error('❌ MongoDB connection error:', error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    
    // Verify connection is ready
    if (!isConnected()) {
      throw new Error('MongoDB connection not ready')
    }
    
    return cached.conn
  } catch (e: any) {
    cached.promise = null
    cached.conn = null
    
    // Retry logic for network errors
    if (retries > 0 && (
      e?.name === 'MongoNetworkError' || 
      e?.name === 'MongoPoolClearedError' ||
      e?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' ||
      e?.message?.includes('SSL') ||
      e?.message?.includes('TLS')
    )) {
      console.log(`🔄 Retrying MongoDB connection (${retries} attempts left)...`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      return connectDB(retries - 1)
    }
    
    console.error('❌ MongoDB connection failed after retries:', e)
    throw e
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
  cached = getCachedConnection()
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
    console.log('MongoDB disconnected')
  }
}

