import mongoose from "mongoose"

const ScanSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  carbonEstimate: { type: Number, required: true },
  category: { type: String, required: true },
  confidence: { type: String, enum: ['high', 'medium', 'low'], required: true },
  barcode: { type: String, required: true },
  date: { type: Date, default: Date.now }
})

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  monthlyCarbon: { type: Number, default: 0 },
  totalScanned: { type: Number, default: 0 },
  joinedAt: { type: String, default: () => new Date().toISOString() },
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  firebaseUid: { type: String, sparse: true },
  // Scan tracking
  scans: [ScanSchema],
  lastScanDate: { type: Date, default: null },
  streakCount: { type: Number, default: 0 },
  bestStreakCount: { type: Number, default: 0 },
}, {
  timestamps: true
})

// Virtual for sustainability level
UserSchema.virtual('sustainabilityLevel').get(function() {
  if (this.monthlyCarbon < 20) return 'Excellent'
  if (this.monthlyCarbon < 35) return 'Good'
  if (this.monthlyCarbon < 50) return 'Average'
  return 'Needs Improvement'
})

export default mongoose.models.User || mongoose.model("User", UserSchema)

