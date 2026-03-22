/**
 * MongoDB Connection & Configuration
 * Using Mongoose for better schema validation
 */

import mongoose from 'mongoose'
import type { Mongoose } from 'mongoose'

interface CachedConnection {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

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

function isConnected(): boolean {
  return mongoose.connection.readyState === 1
}

export async function connectDB(retries = 3): Promise<Mongoose> {
  const mongodbUri = process.env.MONGODB_URI || ''
  if (!mongodbUri) {
    throw new Error('Please define MONGODB_URI in environment variables')
  }

  cached = getCachedConnection()

  if (cached.conn && isConnected()) {
    return cached.conn
  }

  if (cached.promise && !cached.conn) {
    try {
      cached.conn = await cached.promise
      if (isConnected()) {
        return cached.conn
      }
    } catch {
      cached.promise = null
      cached.conn = null
    }
  }

  if (cached.conn && !isConnected()) {
    cached.conn = null
    cached.promise = null
  }

  if (!cached.promise) {
    const isAtlas = mongodbUri.startsWith('mongodb+srv://')

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      ...(isAtlas
        ? {}
        : {
            ssl: true,
            sslValidate: true,
          }),
    }

    cached.promise = mongoose
      .connect(mongodbUri, opts)
      .then((instance) => {
        console.log('MongoDB connected successfully')

        instance.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err)
          if (err.name === 'MongoNetworkError' || err.name === 'MongoPoolClearedError') {
            const cache = getCachedConnection()
            cache.conn = null
            cache.promise = null
          }
        })

        instance.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected')
          const cache = getCachedConnection()
          cache.conn = null
          cache.promise = null
        })

        instance.connection.on('reconnected', () => {
          console.log('MongoDB reconnected')
        })

        return instance
      })
      .catch((error) => {
        cached.promise = null
        console.error('MongoDB connection error:', error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise

    if (!isConnected()) {
      throw new Error('MongoDB connection not ready')
    }

    return cached.conn
  } catch (error: any) {
    cached.promise = null
    cached.conn = null

    if (
      retries > 0 &&
      (error?.name === 'MongoNetworkError' ||
        error?.name === 'MongoPoolClearedError' ||
        error?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' ||
        error?.message?.includes('SSL') ||
        error?.message?.includes('TLS'))
    ) {
      console.log(`Retrying MongoDB connection (${retries} attempts left)...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return connectDB(retries - 1)
    }

    console.error('MongoDB connection failed after retries:', error)
    throw error
  }
}

export async function disconnectDB() {
  cached = getCachedConnection()
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
    console.log('MongoDB disconnected')
  }
}
