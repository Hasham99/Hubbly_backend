
import mongoose, { Schema } from "mongoose";

const educationSchema = {
  highest_degree: String,
  institution: String,
  field_of_study: String
};

const careerSchema = {
  occupation: String,
  company: String,
  monthly_income_range: String
};

const livingSchema = {
  home_ownership: { type: String, enum: ['own', 'rent'] },
  living_with_family: Boolean
};

const photoSchema = {
  url: String,
  is_private: Boolean
};

const parentSchema = {
  marital_status: String,
  educationLevel: String,
  institution: String,
  profession: String,
  city: String,
  area: String,
  country: String,
  home_ownership: String,
  photo: String
};

const siblingSchema = {
  age: String,
  marital_status: String,
  education_level: String,
  institution: String,
  profession: String,
  city: String,
  area: String,
  country: String,
  home_ownership: String,
  photo: String
};

const familyEnvironmentSchema = ({
  type: String,
  notes: String
}, { _id: false });

const matchPreferencesSchema = {
  age_range: {
    min: Number,
    max: Number
  },
  height_range: {
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
  phoneNumber: { type: String, required: true, unique: true }, // Phone number for verification

  // SCREEN 1
  relationship: String, // Who is the profile for? (Son/Daughter/etc.)
  you_are: String, // Who is registering (Father/Mother/etc.)

  // SCREEN 2
  name: String,

  // SCREEN 3
  date_of_birth: Date,
  gender: String,
  height: String,

  // SCREEN 4
  marital_status: String,
  religion: String,
  have_children: Boolean,
  number_of_children: Number,

  // SCREEN 5
  ethnicity: String,
  city: String,
  area: String,
  country: String,
  open_to_move_to_different_city: Boolean,
  open_to_move_to_different_country: Boolean,

  // SCREEN 6
  nationality: String,
  have_dual_nationality: Boolean,
  second_nationality: String,
  have_PR: Boolean,
  PR_country: String,
  languages: [String],

  // SCREEN 7
  education: educationSchema,
  career: careerSchema,
  living: livingSchema,

  // SCREEN 8
  photo: photoSchema,

  // SCREEN 9
  parent_status: {
    mother_alive: Boolean,
    father_alive: Boolean,
    mother: parentSchema,
    father: parentSchema
  },

  // SCREEN 11
  no_of_sisters: Number,
  no_of_brothers: Number,
  total_siblings: Number,

  // SCREEN 12
  siblings: [siblingSchema],

  // SCREEN 13
  family_environment: familyEnvironmentSchema,

  // SCREEN 14
  match_preferences: matchPreferencesSchema
}, { timestamps: true });

export const User = mongoose.model("User", userSchema)