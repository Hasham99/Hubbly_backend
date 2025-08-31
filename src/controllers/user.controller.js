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
import { FileUpload } from "../models/fileUpload.model.js"; // ✅ Add this line
import { sendOtpEmail } from "../utils/email.js";

// Function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

const sendEmailOtpTESTING = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create one (optional behavior)
      user = new User({ email });
    }

    const otp = generateOtp();
    user.emailOtp = otp.toString();
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


const verifyEmailOtpTESTING = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.emailOtpExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.emailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ message: "Email verified successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};


export const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in session
  req.session.otp = otp;
  req.session.email = email;

  // Send OTP via email
  try {
    await sendOtpEmail(email, otp); // Make sure sendOtpEmail() is implemented in utils/email.js
  } catch (error) {
    throw new apiError(500, "Failed to send OTP via email");
  }

  if (existingUser) {
    return res
      .status(200)
      .json(new apiResponse(200, { email }, "OTP sent to your email for login"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, { email }, "OTP sent to your email for registration"));
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    throw new apiError(400, "Email and OTP are required");
  }

  // Validate OTP and email from session
  if (req.session.email !== email || req.session.otp !== otp) {
    throw new apiError(401, "Invalid OTP or session expired");
  }

  // OTP verified, find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  // Issue JWT token
  const token = generateToken(user._id);

  // Clear session data
  req.session.otp = null;
  req.session.email = null;

  return res
    .status(200)
    .json(new apiResponse(200, { token, user }, "Login successful"));
});

// login and register user in one controller
const loginRegisterUser = asyncHandler(async (req, res) => {

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    throw new apiError(400, "Phone number is required");
  }
  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {

    
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  // Store OTP in session
  req.session.otp = otp;
  req.session.phoneNumber = phoneNumber;
  // await sendOtpToSms(phoneNumber, otp);
  return res.status(200).json(new apiResponse(200, {
    phoneNumber,
    otp,
  }, "OTP sent to your phone number for login"));
  }
  // user registration bt sending an otp first then verifying the otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  // Store OTP in session
  req.session.otp = otp;
  req.session.phoneNumber = phoneNumber;
  // await sendOtpToSms(phoneNumber, otp);
  return res.status(200).json(new apiResponse(200, {
    phoneNumber,
    otp,
  }, "OTP sent to your phone number for registration"));
});

const loginRegisterUserTwilio = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new apiError(400, "Phone number is required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in session
  req.session.otp = otp;
  req.session.phoneNumber = phoneNumber;

  // Send OTP via Twilio
  try {
    await sendOtpToSms(phoneNumber, otp);
  } catch (error) {
    throw new apiError(500, "Failed to send OTP via SMS");
  }

  if (existingUser) {
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { phoneNumber },
          "OTP sent to your phone number for login"
        )
      );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { phoneNumber },
        "OTP sent to your phone number for registration"
      )
    );
});

export const loginRegisterUserEmail = asyncHandler(async (req, res,  ) => {
  const { email, password  } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }
  // ✅ Check if this is the demo user (bypass OTP)
  if (
    email === "hashamullah215@gmail.com" &&
    password === "Hubbly$1234$Demo"
  ) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new apiError(404, "Demo user not found");
    }

    // Issue JWT token
    const token = generateToken(user._id);

    return res
      .status(200)
      .json(new apiResponse(200, { token, user }, "Demo user login successful"));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP and email in session
  req.session.otp = otp;
  req.session.email = email;

  // Send OTP via email
  try {
    sendOtpEmail(email, otp); // Your nodemailer function
  } catch (error) {
    throw new apiError(500, "Failed to send OTP via email");
  }

  if (existingUser) {
    return res.status(200).json(
      new apiResponse(200, { email }, "OTP sent to your email for login")
    );
  }

  return res.status(200).json(
    new apiResponse(200, { email }, "OTP sent to your email for registration")
  );
});

export const deleteUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found");
  }

  // Delete the user
  await User.deleteOne({ email });

  return res
    .status(200)
    .json(new apiResponse(200, {}, `User with email ${email} deleted successfully`));
});

const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
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
    email,
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

// POST /api/upload-test
export const uploadTestFile = asyncHandler(async (req, res) => {
  const file = req.files?.file?.[0]; // Updated for fields usage

  if (!file) {
    throw new apiError(400, "No file uploaded.");
  }

  const uploaded = await uploadOnCloudinary(file.path);

  if (!uploaded?.url) {
    throw new apiError(500, "Cloudinary upload failed.");
  }

  const savedFile = await FileUpload.create({
    fileName: file.originalname,
    cloudinaryUrl: uploaded.url,
    fileType: file.mimetype,
  });

  return res.status(201).json(
    new apiResponse(201, savedFile, "File uploaded and saved successfully.")
  );
});

// GET /api/upload-test
export const getUploadedFiles = asyncHandler(async (req, res) => {
  const files = await FileUpload.find().sort({ createdAt: -1 });
  return res.status(200).json(
    new apiResponse(200, files, "Uploaded files retrieved successfully.")
  );
});

const registerUserFileUpload = asyncHandler(async (req, res) => {
  const {
    email,
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
    parentStatus = {},
    noOfSisters,
    noOfBrothers,
    totalSiblings,
    siblings = [],
    familyEnvironment = {},
    matchPreferences = {}
  } = req.body;

  // Required field validation
  if (!phoneNumber) {
    throw new apiError(400, "Missing required field: phoneNumber.");
  }

  // Check for existing user
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new apiError(409, "User already registered.");
  }

  // Files from multer
  const files = req.files || {};
  const photoFile = files.photo?.[0];
  const motherPhotoFile = files.mother_photo?.[0];
  const fatherPhotoFile = files.father_photo?.[0];
  const siblingPhotoFiles = files.sibling_photos || [];
  console.log("Received files:", {
    photoFile,
    motherPhotoFile,
    fatherPhotoFile,
    siblingPhotoFiles: siblingPhotoFiles.map(file => file.originalname)
  }
  );


  // Upload to Cloudinary
  const uploadedPhoto = photoFile ? await uploadOnCloudinary(photoFile.path) : null;
  const uploadedMotherPhoto = motherPhotoFile ? await uploadOnCloudinary(motherPhotoFile.path) : null;
  const uploadedFatherPhoto = fatherPhotoFile ? await uploadOnCloudinary(fatherPhotoFile.path) : null;

  console.log("Uploaded Photos:", {
    uploadedPhoto,
    uploadedMotherPhoto,
    uploadedFatherPhoto
  }
  );
  
  const siblingPhotos = [];
  for (const file of siblingPhotoFiles) {
    const uploaded = await uploadOnCloudinary(file.path);
    if (uploaded) siblingPhotos.push(uploaded.url);
  }

  // Combine sibling data with photo
  let siblingsData = [];
  try {
    const parsedSiblings = typeof siblings === 'string' ? JSON.parse(siblings) : siblings;

    siblingsData = parsedSiblings.map((sibling, idx) => ({
      ...sibling,
      photo: siblingPhotos[idx] || null
    }));
  } catch (err) {
    throw new apiError(400, "Invalid siblings data format.");
  }

  // Build user object
  const user = await User.create({
    email,
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
    photo: uploadedPhoto ? {
      url: uploadedPhoto.url,
      isPrivate: false
    } : undefined,
    parentStatus: {
      motherAlive: parentStatus?.motherAlive === 'true',
      fatherAlive: parentStatus?.fatherAlive === 'true',
      mother: {
        ...parentStatus?.mother,
        photo: uploadedMotherPhoto?.url || null
      },
      father: {
        ...parentStatus?.father,
        photo: uploadedFatherPhoto?.url || null
      }
    },
    noOfSisters,
    noOfBrothers,
    totalSiblings,
    siblings: siblingsData,
    familyEnvironment,
    matchPreferences
  });

  const token = generateToken(user._id);

  return res.status(201).json(
    new apiResponse(201, { user, token }, "User registered successfully.")
  );
});

// Function to handle file upload
const testUpload = asyncHandler(async (req, res) => {
  const { file } = req.body;
  if (!file) {
    throw new apiError(400, "File is required");
  }

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

export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new apiError(401, "User not authenticated.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  const nestedMergeFields = ["education", "career", "living", "photo", "parentStatus", "familyEnvironment", "matchPreferences"];
  const fullReplaceFields = [
    "relationship", "youAre", "name", "dateOfBirth", "gender", "height",
    "maritalStatus", "religion", "haveChildren", "numberOfChildren",
    "ethnicity", "city", "area", "country", "openToMoveToDifferentCity", "openToMoveToDifferentCountry",
    "nationality", "haveDualNationality", "secondNationality", "havePr", "prCountry",
    "languages", "noOfSisters", "noOfBrothers", "totalSiblings", "siblings"
  ];

  // Shallow updates
  fullReplaceFields.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  // Deep merge nested fields
  nestedMergeFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === "object") {
      user[field] = {
        ...user[field]?.toObject?.() || {}, // existing data
        ...req.body[field]               // new updates
      };
    }
  });

  const updatedUser = await user.save();

  return res.status(200).json(
    new apiResponse(200, updatedUser, "User updated successfully.")
  );
});

export const updateUserWithFiles = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new apiError(401, "User not authenticated.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  const files = req.files || {};
  const body = req.body;

  // Upload and set photo
  if (files.photo?.[0]) {
    const uploaded = await uploadOnCloudinary(files.photo[0].path);
    user.photo = { url: uploaded.url, isPrivate: false };
  }

  if (files.mother_photo?.[0]) {
    const uploaded = await uploadOnCloudinary(files.mother_photo[0].path);
    user.parentStatus = {
      ...user.parentStatus,
      mother: {
        ...user.parentStatus?.mother,
        photo: uploaded.url
      }
    };
  }

  if (files.father_photo?.[0]) {
    const uploaded = await uploadOnCloudinary(files.father_photo[0].path);
    user.parentStatus = {
      ...user.parentStatus,
      father: {
        ...user.parentStatus?.father,
        photo: uploaded.url
      }
    };
  }

  // Handle siblings with photo uploads
  const siblingPhotoFiles = files.sibling_photos || [];
  if (body.siblings || siblingPhotoFiles.length > 0) {
    let siblings = [];

    try {
      const parsed = typeof body.siblings === "string"
        ? JSON.parse(body.siblings)
        : body.siblings;

      for (let i = 0; i < parsed.length; i++) {
        const sibling = parsed[i];
        let photoUrl = user.siblings?.[i]?.photo || null;

        if (siblingPhotoFiles[i]) {
          const uploaded = await uploadOnCloudinary(siblingPhotoFiles[i].path);
          photoUrl = uploaded.url;
        }

        siblings.push({
          ...sibling,
          photo: photoUrl
        });
      }

      user.siblings = siblings;
    } catch (e) {
      throw new apiError(400, "Invalid siblings format.");
    }
  }

  // Full replace fields
  const fullReplaceFields = [
    "relationship", "youAre", "name", "dateOfBirth", "gender", "height",
    "maritalStatus", "religion", "haveChildren", "numberOfChildren",
    "ethnicity", "city", "area", "country", "openToMoveToDifferentCity", "openToMoveToDifferentCountry",
    "nationality", "haveDualNationality", "secondNationality", "havePr", "prCountry",
    "languages", "noOfSisters", "noOfBrothers", "totalSiblings"
  ];

  fullReplaceFields.forEach(field => {
    if (body[field] !== undefined) {
      user[field] = body[field];
    }
  });

  // Nested merge fields
  const nestedMergeFields = [
    "education", "career", "living", "parentStatus", "familyEnvironment", "matchPreferences"
  ];

  nestedMergeFields.forEach(field => {
    if (body[field] && typeof body[field] === "object") {
      const parsed = typeof body[field] === "string" ? JSON.parse(body[field]) : body[field];
      user[field] = {
        ...user[field]?.toObject?.() || {},
        ...parsed
      };
    }
  });

  const updatedUser = await user.save();

  return res.status(200).json(
    new apiResponse(200, updatedUser, "User updated successfully.")
  );
});

export const likeUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.body;

  if (!targetUserId || targetUserId === userId.toString()) {
    throw new apiError(400, "Invalid target user.");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new apiError(404, "Target user not found.");
  }

  const user = await User.findById(userId);

  if (!user.interestedIn.includes(targetUserId)) {
    user.interestedIn.push(targetUserId);
    await user.save();
  }

  return res.status(200).json(
    new apiResponse(200, user.interestedIn, "User liked successfully.")
  );
});

export const unlikeUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.body;

  const user = await User.findById(userId);

  const beforeLength = user.interestedIn.length;
  user.interestedIn = user.interestedIn.filter(
    (id) => id.toString() !== targetUserId
  );

  if (user.interestedIn.length < beforeLength) {
    await user.save();
    return res.status(200).json(
      new apiResponse(200, user.interestedIn, "User unliked successfully.")
    );
  } else {
    return res.status(200).json(
      new apiResponse(200, user.interestedIn, "User was not in interested list.")
    );
  }
});

export const getUsersWhoLikedMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all users where interestedIn includes my userId
  const users = await User.find({ interestedIn: userId })
    .select("name phoneNumber photo interestedIn") // select any relevant fields
    .lean();

  return res.status(200).json(
    new apiResponse(200, users, "Users who liked you.")
  );
});

export {loginRegisterUser,loginRegisterUserTwilio, registerUser, getUser, loginUser, verifyOtp, getUserById, registerUserFileUpload};
