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
    youAre,
    name,
    dateOfBirth,
    gender,
    height,
    maritalStatus,
    religion,
    haveChildren,
    numberOfChildren,
    ethnicity,
    city,
    area,
    country,
    openToMoveToDifferentCity,
    openToMoveToDifferentCountry,
    nationality,
    haveDualNationality,
    secondNationality,
    havePr,
    prCountry,
    languages = [],
    education = {},
    career = {},
    living = {},
    photo = {},
    parentStatus = {},
    noOfSisters,
    noOfBrothers,
    totalSiblings,
    siblings = [],
    familyEnvironment = {},
    matchPreferences = {}
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
    youAre,
    name,
    dateOfBirth,
    gender,
    height,
    maritalStatus,
    religion,
    haveChildren,
    numberOfChildren,
    ethnicity,
    city,
    area,
    country,
    openToMoveToDifferentCity,
    openToMoveToDifferentCountry,
    nationality,
    haveDualNationality,
    secondNationality,
    havePr,
    prCountry,
    languages,
    education,
    career,
    living,
    photo,
    parentStatus,
    noOfSisters,
    noOfBrothers,
    totalSiblings,
    siblings,
    familyEnvironment,
    matchPreferences
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
export const findMatches = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  
  const currentUser = await User.findById(userId);
  
  if (!currentUser) throw new apiError(404, "User not found");

  const { matchPreferences } = currentUser;

  if (!matchPreferences) throw new apiError(400, "Match preferences not set");

  const currentAge = Math.floor(
    (Date.now() - new Date(currentUser.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const candidates = await User.find({ _id: { $ne: currentUser._id } });

  const matches = [];

  candidates.forEach(candidate => {
    const matchReasons = [];

    const candidateAge = Math.floor(
      (Date.now() - new Date(candidate.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)
    );

    // Age match
    if (
      candidateAge >= matchPreferences.ageRange.min &&
      candidateAge <= matchPreferences.ageRange.max
    ) {
      matchReasons.push("age");
    }

    // Religion
    if (candidate.religion === matchPreferences.religion) {
      matchReasons.push("religion");
    }

    // Ethnicity
    if (candidate.ethnicity === matchPreferences.ethnicity) {
      matchReasons.push("ethnicity");
    }

    // Education (loose match)
    if (
      candidate.education?.highestDegree?.toLowerCase() ===
      matchPreferences.education?.toLowerCase()
    ) {
      matchReasons.push("education");
    }

    // Location (if match_preferences.location includes candidate.city or candidate.country)
    const prefLocations = matchPreferences.location?.split(",").map(loc => loc.trim().toLowerCase());
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
