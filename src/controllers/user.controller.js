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

export { registerUser, getUser, loginUser, verifyOtp, getUserById};
