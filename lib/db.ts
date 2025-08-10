// lib/db.js
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

const options = {}

let client
let clientPromise

/**
 * In development mode, use a global variable so that the client
 * is cached across module reloads (HMR), otherwise you'll open
 * too many connections to MongoDB.
 */
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
