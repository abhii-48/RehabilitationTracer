import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  // Patient Specific Fields
  patientId: {
    type: String,
    unique: true,
    sparse: true // Only enforce uniqueness if field exists
  },
  // Doctor Specific Fields
  doctorId: {
    type: String,
    unique: true,
    sparse: true
  },
  domain: {
    type: String,
    enum: [
      'Physiotherapist',
      'Orthopedic Specialist',
      'Sports Injury Specialist',
      'Occupational Therapist',
      'Neurologist (Rehabilitation)',
      'Pain Management Specialist',
      'Rehabilitation Physician (PM&R)',
      'Psychologist (Rehabilitation Support)',
      'Geriatric Care Specialist'
    ]
  },
  experience: {
    type: String, // e.g. "12 Years"
    default: "5+ Years"
  },
  patientsTreated: {
    type: String, // e.g. "500+"
    default: "100+"
  },
  successRate: {
    type: String, // e.g. "98%"
    default: "95%"
  },
  about: {
    type: String,
    default: "Specializes in rehabilitation."
  },
  // Profile Details (Patient/Common)
  age: { type: Number },
  gender: { type: String },
  height: { type: String }, // e.g. "5'10" or "178cm"
  weight: { type: String }, // e.g. "170lbs" or "75kg"

  // Doctor Availability
  availabilityStatus: {
    type: String,
    enum: ['Available', 'Busy', 'On Leave'],
    default: 'Available'
  },

  // Account Status (for Soft Delete/Deactivation)
  isActive: {
    type: Boolean,
    default: true
  },

  // Settings Object
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      // Patient Specific
      dailyCheckIn: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      programUpdates: { type: Boolean, default: true },
      // Doctor Specific
      newRequests: { type: Boolean, default: true },
      patientUpdates: { type: Boolean, default: true },
      taskCompletions: { type: Boolean, default: true },
      programCompletion: { type: Boolean, default: true }
    },
    privacy: {
      // Patient Specific
      allowDoctorViewFiles: { type: Boolean, default: true },
      allowDoctorViewHistory: { type: Boolean, default: true }
    },
    programDefaults: {
      // Doctor Specific
      frequencyHours: { type: Number, default: 24 },
      resetIntervalHours: { type: Number, default: 24 },
      painThreshold: { type: Number, default: 7 }
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);
