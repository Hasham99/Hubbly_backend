import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../utils/supabaseClient.js"; // Initialize Supabase client
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
// import { sendOtpToWhatsApp } from '../utils/twilioUtils.js';
import { sendOtpToSms } from "../utils/twilioUtils.js"; // Import Twilio utility for sending OTPs
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    phoneNumber,
    relationship,
    you_are,
    name,
    date_of_birth,
    gender,
    height,
    marital_status,
    religion,
    have_children,
    number_of_children,
    ethnicity,
    city,
    area,
    country,
    open_to_move_to_different_city,
    open_to_move_to_different_country,
    nationality,
    have_dual_nationality,
    second_nationality,
    have_PR,
    PR_country,
    languages = [],
    education = {},
    career = {},
    living = {},
    photo = {},
    parent_status = {},
    no_of_sisters,
    no_of_brothers,
    total_siblings,
    siblings = [],
    family_environment = {},
    match_preferences = {}
  } = req.body;

  // Validate required field
  if (!phoneNumber) {
    throw new apiError(400, "Missing required field: phoneNumber is required.");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new apiError(409, "User already registered.");
  }

  // Create new user
  const user = await User.create({
    phoneNumber,
    relationship,
    you_are,
    name,
    date_of_birth,
    gender,
    height,
    marital_status,
    religion,
    have_children,
    number_of_children,
    ethnicity,
    city,
    area,
    country,
    open_to_move_to_different_city,
    open_to_move_to_different_country,
    nationality,
    have_dual_nationality,
    second_nationality,
    have_PR,
    PR_country,
    languages,
    education,
    career,
    living,
    photo,
    parent_status,
    no_of_sisters,
    no_of_brothers,
    total_siblings,
    siblings,
    family_environment,
    match_preferences
  });

  // Generate JWT token
  const token = generateToken(user._id);

  return res.status(201).json(
    new apiResponse(201, {
      user,
      token
    }, "User registered successfully.")
  );
});

const registerUser01 = asyncHandler(async (req, res) => {
  const {
    phoneNumber,
    relationship,
    you_are,
    name,
    date_of_birth,
    gender,
    height,
    marital_status,
    religion,
    have_children,
    number_of_children,
    ethnicity,
    city,
    area,
    country,
    open_to_move_to_different_city,
    open_to_move_to_different_country,
    nationality,
    have_dual_nationality,
    second_nationality,
    have_PR,
    PR_country,
    languages,
    education,
    career,
    living,
    photo,
    parent_status,
    no_of_sisters,
    no_of_brothers,
    total_siblings,
    siblings,
    family_environment,
    match_preferences
  } = req.body;

  if (!phoneNumber) {
    throw new apiError(400, "Missing required fields: phoneNumber is required.");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new apiError(409, "User already registered.");
  }

  // Create new user
  const user = await User.create({
    phoneNumber,
    // supabaseId,
    relationship,
    you_are,
    name,
    date_of_birth,
    gender,
    height,
    marital_status,
    religion,
    have_children,
    number_of_children,
    ethnicity,
    city,
    area,
    country,
    open_to_move_to_different_city,
    open_to_move_to_different_country,
    nationality,
    have_dual_nationality,
    second_nationality,
    have_PR,
    PR_country,
    languages,
    education,
    career,
    living,
    photo,
    parent_status,
    no_of_sisters,
    no_of_brothers,
    total_siblings,
    siblings,
    family_environment,
    match_preferences
  });

  const token = generateToken(user._id); // Generate JWT token for the user
  
  return res.status(201).json(new apiResponse(201, {
    user: user,
    token: token, // Include the token in the response
  }, "User registered successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new apiError(400, "Phone number is required");
  }

  const user = await User.findOne({ phoneNumber });
  if (!user) {
    throw new apiError(404, "User not found with this phone number");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  // Store OTP in session
  req.session.otp = otp;
  req.session.phoneNumber = phoneNumber;

  // await sendOtpToSms(phoneNumber, otp);

  return res.status(200).json(new apiResponse(200, {
    phoneNumber,
    otp,
  }, "OTP sent to your phone number"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!otp || !phoneNumber) {
    throw new apiError(400, "Phone number and OTP are required");
  }

  if (
    req.session.phoneNumber !== phoneNumber ||
    req.session.otp !== otp
  ) {
    throw new apiError(401, "Invalid OTP or session expired");
  }

  // OTP verified, issue JWT token
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  const token = generateToken(user._id);

  // Clear session
  req.session.otp = null;
  req.session.phoneNumber = null;

  return res.status(200).json(new apiResponse(200, { token, user }, "Login successful"));
});


const getUser = asyncHandler(async (req, res) => {
  const users = await User.find();

  return res
    .status(200)
    .json(new apiResponse(200, users, "All users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

   // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "Invalid user ID format");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, user, "User fetched successfully"));
});

export const handleSocketConnection = (socket, io) => {
  socket.on("match_request", async (userData) => {
    try {
      // Example: Match users within same city and age range
      const { age, city, gender } = userData;

      const matchedUsers = await User.find({
        city,
        gender: { $ne: gender }, // match with opposite gender
        date_of_birth: { 
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - (age + 3))),
          $lte: new Date(new Date().setFullYear(new Date().getFullYear() - (age - 3)))
        }
      });

      socket.emit("match_result", matchedUsers);
    } catch (error) {
      console.error("Match error:", error.message);
      socket.emit("match_error", { error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
};

// Matchmaking controller
export const findMatches01 = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  // Extract match preferences
  const preferences = user.match_preferences;

  const query = {
    _id: { $ne: user._id }, // Exclude self
    gender: { $ne: user.gender }, // Opposite gender (optional logic)
    "date_of_birth": {
      $gte: new Date(new Date().setFullYear(new Date().getFullYear() - preferences.age_range.max)),
      $lte: new Date(new Date().setFullYear(new Date().getFullYear() - preferences.age_range.min)),
    },
    "education.highest_degree": preferences.education,
    religion: preferences.religion,
    ethnicity: preferences.ethnicity,
    city: preferences.location // Simplified location filter
  };

  const matches = await User.find(query).limit(10);

  return res.status(200).json(new apiResponse(200, matches, "Matches found"));
});

export const findMatches02 = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const preferences = user.match_preferences || {};
  const query = { _id: { $ne: user._id } };

  // Opposite gender (optional)
  if (user.gender) {
    query.gender = { $ne: user.gender };
  }

  // Age range filter
  if (preferences.age_range?.min && preferences.age_range?.max) {
    const maxDOB = new Date(new Date().setFullYear(new Date().getFullYear() - preferences.age_range.min));
    const minDOB = new Date(new Date().setFullYear(new Date().getFullYear() - preferences.age_range.max));
    query.date_of_birth = { $gte: minDOB, $lte: maxDOB };
  }

  // Optional filters
  if (preferences.education) {
    query["education.highest_degree"] = preferences.education;
  }

  if (preferences.religion) {
    query.religion = preferences.religion;
  }

  if (preferences.ethnicity) {
    query.ethnicity = preferences.ethnicity;
  }

  if (preferences.location) {
    query.city = preferences.location;
  }

  const matches = await User.find(query).limit(10);

  return res.status(200).json(new apiResponse(200, matches, "Matches found"));
});

export const findMatches = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  
  const currentUser = await User.findById(userId);
  
  if (!currentUser) throw new apiError(404, "User not found");

  const { match_preferences } = currentUser;

  if (!match_preferences) throw new apiError(400, "Match preferences not set");

  const currentAge = Math.floor(
    (Date.now() - new Date(currentUser.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const candidates = await User.find({ _id: { $ne: currentUser._id } });

  const matches = [];

  candidates.forEach(candidate => {
    const matchReasons = [];

    const candidateAge = Math.floor(
      (Date.now() - new Date(candidate.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25)
    );

    // Age match
    if (
      candidateAge >= match_preferences.age_range.min &&
      candidateAge <= match_preferences.age_range.max
    ) {
      matchReasons.push("age");
    }

    // Religion
    if (candidate.religion === match_preferences.religion) {
      matchReasons.push("religion");
    }

    // Ethnicity
    if (candidate.ethnicity === match_preferences.ethnicity) {
      matchReasons.push("ethnicity");
    }

    // Education (loose match)
    if (
      candidate.education?.highest_degree?.toLowerCase() ===
      match_preferences.education?.toLowerCase()
    ) {
      matchReasons.push("education");
    }

    // Location (if match_preferences.location includes candidate.city or candidate.country)
    const prefLocations = match_preferences.location?.split(",").map(loc => loc.trim().toLowerCase());
    if (
      prefLocations?.includes(candidate.city?.toLowerCase()) ||
      prefLocations?.includes(candidate.country?.toLowerCase())
    ) {
      matchReasons.push("location");
    }

    if (matchReasons.length > 0) {
      matches.push({
        candidate,
        matchBy: matchReasons
      });
    }
  });

  return res.status(200).json(
    new apiResponse(200, matches, matches.length > 0 ? "Matches found" : "No matches found")
  );
});

export { registerUser, getUser, loginUser, verifyOtp, getUserById};
