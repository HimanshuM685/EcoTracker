import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  monthlyCarbon: { type: Number, default: 0 },
  totalScanned: { type: Number, default: 0 },
  joinedAt: { type: String, default: () => new Date().toISOString() },
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  firebaseUid: { type: String, sparse: true }, // Only for Google users
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model("User", UserSchema)

