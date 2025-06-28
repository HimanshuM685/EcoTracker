import mongoose, { Mongoose } from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!
console.log("Mongodb_URI: ", MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Fix: Extend the global type
declare global {
  var mongoose: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  } | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect(): Promise<Mongoose> {
  if (cached!.conn) return cached!.conn

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      dbName: "carbontracker",
    })
  }

  cached!.conn = await cached!.promise
  return cached!.conn
}

export default dbConnect







