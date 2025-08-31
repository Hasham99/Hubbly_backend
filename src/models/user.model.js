
import mongoose, { Schema } from "mongoose";

const educationSchema = {
  highestDegree: String,
  institution: String,
  fieldOfStudy: String
};

const careerSchema = {
  occupation: String,
  company: String,
  monthlyIncomeRange: String
};

const livingSchema = {
  homeOwnership: { type: String, enum: ['own', 'rent'] },
  livingWithFamily: Boolean
};

const photoSchema = {
  url: String,
  isPrivate: Boolean
};

const parentSchema = {
  maritalStatus: String,
  educationLevel: String,
  institution: String,
  profession: String,
  city: String,
  area: String,
  country: String,
  homeOwnership: String,
  photo: String
};

const siblingSchema = {
  age: String,
  maritalStatus: String,
  educationLevel: String,
  institution: String,
  profession: String,
  city: String,
  area: String,
  country: String,
  homeOwnership: String,
  photo: String
};

const familyEnvironmentSchema = ({
  type: String,
  notes: String
}, { _id: false });

const matchPreferencesSchema = {
  ageRange: {
    min: Number,
    max: Number
  },
  heightRange: {
    min: String,
    max: String
  },
  education: String,
  religion: String,
  ethnicity: String,
  location: String
};

const userSchema = new Schema({
    
  // supabaseId: { type: String, required: true, unique: true }, // Link to Supabase user
  phoneNumber: { type: String, unique: true }, // Phone number for verification
  
  // NEW FIELDS FOR EMAIL OTP VERIFICATION
  // , sparse: true
  email: { type: String, unique: true, required: true }, // email is optional but unique
  // emailVerified: { type: Boolean, default: false },
  // emailOtp: String,
  // emailOtpExpires: Date,

  // SCREEN 1
  relationship: String, // Who is the profile for? (Son/Daughter/etc.)
  youAre: String, // Who is registering (Father/Mother/etc.)

  // SCREEN 2
  name: String,

  // SCREEN 3
  dateOfBirth: Date,
  gender: String,
  height: String,

  // SCREEN 4
  maritalStatus: String,
  religion: String,
  haveChildren: Boolean,
  numberOfChildren: Number,

  // SCREEN 5
  ethnicity: String,
  city: String,
  area: String,
  country: String,
  openToMoveToDifferentCity: Boolean,
  openToMoveToDifferentCountry: Boolean,

  // SCREEN 6
  nationality: String,
  haveDualNationality: Boolean,
  secondNationality: String,
  havePr: Boolean,
  prCountry: String,
  languages: [String],

  // SCREEN 7
  education: educationSchema,
  career: careerSchema,
  living: livingSchema,

  // SCREEN 8
  photo: photoSchema,

  // SCREEN 9
  parentStatus: {
    motherAlive: Boolean,
    fatherAlive: Boolean,
    mother: parentSchema,
    father: parentSchema
  },

  // SCREEN 11
  noOfSisters: Number,
  noOfBrothers: Number,
  totalSiblings: Number,

  // SCREEN 12
  siblings: [siblingSchema],

  // SCREEN 13
  familyEnvironment: familyEnvironmentSchema,

  // SCREEN 14
  matchPreferences: matchPreferencesSchema,

  // User interests
  interestedIn: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const User = mongoose.model("User", userSchema)