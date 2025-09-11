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

const userWithPasswordSchema = new Schema({
  phoneNumber: { type: String, unique: true },
  email: { type: String, unique: true, required: true },

  // ✅ new field
  password: { type: String, required: true },

  relationship: String,
  youAre: String,
  name: String,
  dateOfBirth: Date,
  gender: String,
  height: String,
  maritalStatus: String,
  religion: String,
  haveChildren: Boolean,
  numberOfChildren: Number,
  ethnicity: String,
  city: String,
  area: String,
  country: String,
  openToMoveToDifferentCity: Boolean,
  openToMoveToDifferentCountry: Boolean,
  nationality: String,
  haveDualNationality: Boolean,
  secondNationality: String,
  havePr: Boolean,
  prCountry: String,
  languages: [String],

  education: educationSchema,
  career: careerSchema,
  living: livingSchema,
  photo: photoSchema,

  parentStatus: {
    motherAlive: Boolean,
    fatherAlive: Boolean,
    mother: parentSchema,
    father: parentSchema
  },

  noOfSisters: Number,
  noOfBrothers: Number,
  totalSiblings: Number,
  siblings: [siblingSchema],
  familyEnvironment: familyEnvironmentSchema,
  matchPreferences: matchPreferencesSchema,

  interestedIn: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserWithPassword" }],
}, { timestamps: true });

export const UserWithPassword = mongoose.model("UserWithPassword", userWithPasswordSchema);
