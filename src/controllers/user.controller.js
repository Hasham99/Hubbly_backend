import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../utils/supabaseClient.js"; // Initialize Supabase client
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
// import { sendOtpToWhatsApp } from '../utils/twilioUtils.js';
import { sendOtpToSms } from "../utils/twilioUtils.js"; // Import Twilio utility for sending OTPs
import Jwt from "jsonwebtoken";

// Register user controller
// Register user controller
const registerUser01 = asyncHandler(async (req, res) => {
  // Destructure the request body to extract user data and authentication info
  const {
    email,
    password,
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
    match_preferences,
  } = req.body;

  // Step 1: Register the user with Supabase
  const { user, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  // Handle any authentication errors from Supabase
  if (authError) {
    // console.log("Supabase Auth Error:", authError.message);
    throw new apiError(400, "Authentication Error: " + authError.message);
  }

  // Step 2: Save the user information in MongoDB
  const newUser = new User({
    supabaseId: user.id, // Link to Supabase user ID
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
    match_preferences,
  });

  // Save the user to the database
  await newUser.save();

  // Step 3: Send a success response using apiResponse
  return res
    .status(201)
    .json(new apiResponse(201, newUser, "User registered successfully"));
});

const registerUser02 = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // Only email and password for now

  // Step 1: Register the user with Supabase Authentication using .then()
  await supabase.auth
    .signUp({
      email,
      password,
    })
    .then(({ data, error }) => {
      // Step 2: Handle authentication error
      if (error) {
        console.log("Authentication error occurred:", error);
        return res
          .status(400)
          .json(
            new apiError(400, "Authentication Error: " + error.message, [error])
          );
      }

      // Step 3: Handle successful registration
      console.log("User created in Supabase:", data.user);

      return res.status(201).json(
        new apiResponse(
          201,
          {
            user: data.user, // Return the user data (id, email, etc.)
            session: data.session, // Return session data (for authenticated users)
          },
          "User registered successfully"
        )
      );
    })
    .catch((err) => {
      // Step 4: Catch any unexpected errors
      console.error("Unexpected error:", err);
      return res
        .status(500)
        .json(new apiError(500, "Unexpected error occurred", [err]));
    });
});

const registerUserWithoutCloud = asyncHandler(async (req, res) => {
  const {
    email,
    password,
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
    match_preferences,
  } = req.body;

  // Register the user with Supabase Authentication
  await supabase.auth
    .signUp({
      email,
      password,
    })
    .then(async ({ data, error }) => {
      // Handle any authentication errors
      if (error) {
        console.log("Authentication error occurred:", error);
        return res
          .status(400)
          .json(
            new apiError(400, "Authentication Error: " + error.message, [error])
          );
      }

      // Step 2: Save the user details in Supabase
      await supabase
        .from("users")
        .insert([
          {
            supabase_id: data.user.id,
            email: email,
            relationship: relationship,
            you_are: you_are,
            name: name,
            date_of_birth: date_of_birth,
            gender: gender,
            height: height,
            marital_status: marital_status,
            religion: religion,
            have_children: have_children,
            number_of_children: number_of_children,
            ethnicity: ethnicity,
            city: city,
            area: area,
            country: country,
            open_to_move_to_different_city: open_to_move_to_different_city,
            open_to_move_to_different_country:
              open_to_move_to_different_country,
            nationality: nationality,
            have_dual_nationality: have_dual_nationality,
            second_nationality: second_nationality,
            have_pr: have_PR,
            pr_country: PR_country,
            languages: languages,
            education: education,
            career: career,
            living: living,
            photo: photo,
            parent_status: parent_status,
            no_of_sisters: no_of_sisters,
            no_of_brothers: no_of_brothers,
            total_siblings: total_siblings,
            siblings: siblings,
            family_environment: family_environment,
            match_preferences: match_preferences,
          },
        ])
        .then(({ data, error: dbError }) => {
          // Handle any database errors
          if (dbError) {
            console.log("Database error occurred:", dbError);
            return res
              .status(400)
              .json(
                new apiError(400, "Database Error: " + dbError.message, [
                  dbError,
                ])
              );
          }

          // Step 3: Return the newly registered user data
          return res
            .status(201)
            .json(
              new apiResponse(
                201,
                data,
                "User registered and data saved successfully"
              )
            );
        });
    })
    .catch((err) => {
      // Catch unexpected errors
      console.error("Unexpected error:", err);
      return res
        .status(500)
        .json(new apiError(500, "Unexpected error occurred", [err]));
    });
});

const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
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
    match_preferences,
  } = req.body;

  // Handle multiple photo uploads (user, parent, siblings)
  let uploadedUserPhotoUrl = null;
  let uploadedMotherPhotoUrl = null;
  let uploadedFatherPhotoUrl = null;
  let uploadedSiblingPhotosUrls = [];

  // Step 1: Handle user photo upload (if provided)
  if (req.files && req.files.photo && req.files.photo[0]) {
    const localFilePath = req.files.photo[0].path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      uploadedUserPhotoUrl = cloudinaryResponse.url;
    } else {
      return res
        .status(400)
        .json(
          new apiError(400, "Error uploading user photo to Cloudinary", [])
        );
    }
  }

  // Step 2: Handle parent photos upload (if provided)
  if (req.files && req.files.mother_photo && req.files.mother_photo[0]) {
    const localFilePath = req.files.mother_photo[0].path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      uploadedMotherPhotoUrl = cloudinaryResponse.url;
    } else {
      return res
        .status(400)
        .json(
          new apiError(400, "Error uploading mother photo to Cloudinary", [])
        );
    }
  }

  if (req.files && req.files.father_photo && req.files.father_photo[0]) {
    const localFilePath = req.files.father_photo[0].path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      uploadedFatherPhotoUrl = cloudinaryResponse.url;
    } else {
      return res
        .status(400)
        .json(
          new apiError(400, "Error uploading father photo to Cloudinary", [])
        );
    }
  }

  // Step 3: Handle sibling photos upload (if provided)
  if (req.files && req.files.sibling_photos) {
    for (let i = 0; i < req.files.sibling_photos.length; i++) {
      const localFilePath = req.files.sibling_photos[i].path;
      const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
      if (cloudinaryResponse && cloudinaryResponse.url) {
        uploadedSiblingPhotosUrls.push(cloudinaryResponse.url);
      } else {
        return res
          .status(400)
          .json(
            new apiError(400, "Error uploading sibling photo to Cloudinary", [])
          );
      }
    }
  }

  // Step 4: Register the user with Supabase Authentication
  await supabase.auth
    .signUp({
      email,
      password,
    })
    .then(async ({ data, error }) => {
      // Handle any authentication errors
      if (error) {
        console.log("Authentication error occurred:", error);
        return res
          .status(400)
          .json(
            new apiError(400, "Authentication Error: " + error.message, [error])
          );
      }

      // Step 5: Save the user details in Supabase, including the photo URLs from Cloudinary
      await supabase
        .from("users")
        .insert([
          {
            supabase_id: data.user.id, // Use the ID from Supabase Auth
            email: email,
            phoneNumber,phoneNumber,
            relationship: relationship,
            you_are: you_are,
            name: name,
            date_of_birth: date_of_birth,
            gender: gender,
            height: height,
            marital_status: marital_status,
            religion: religion,
            have_children: have_children,
            number_of_children: number_of_children,
            ethnicity: ethnicity,
            city: city,
            area: area,
            country: country,
            open_to_move_to_different_city: open_to_move_to_different_city,
            open_to_move_to_different_country:
              open_to_move_to_different_country,
            nationality: nationality,
            have_dual_nationality: have_dual_nationality,
            second_nationality: second_nationality,
            have_pr: have_PR,
            pr_country: PR_country,
            languages: languages,
            education: education,
            career: career,
            living: living,
            photo: { url: uploadedUserPhotoUrl, is_private: false }, // User photo from Cloudinary
            parent_status: {
              mother_alive: parent_status.mother_alive,
              father_alive: parent_status.father_alive,
              mother: {
                ...parent_status.mother,
                photo: uploadedMotherPhotoUrl, // Mother photo from Cloudinary
              },
              father: {
                ...parent_status.father,
                photo: uploadedFatherPhotoUrl, // Father photo from Cloudinary
              },
            },
            no_of_sisters: no_of_sisters,
            no_of_brothers: no_of_brothers,
            total_siblings: total_siblings,
            siblings: siblings.map((sibling, index) => ({
              ...sibling,
              photo: uploadedSiblingPhotosUrls[index] || "", // Sibling photos from Cloudinary
            })),
            family_environment: family_environment,
            match_preferences: match_preferences,
          },
        ])
        .then(({ data: userData, error: dbError }) => {
          // Handle database errors
          if (dbError) {
            console.log("Database error occurred:", dbError);
            return res
              .status(400)
              .json(
                new apiError(
                  400,
                  "Error saving user data: " + dbError.message,
                  [dbError]
                )
              );
          }
           // Log the response to verify if the data is correctly inserted
        console.log("Database response:", userData);

          return res.status(201).json(
            new apiResponse(
              201,
              {
                user: data.user, // Return the user data (id, email, etc.)
                session: data.session, // Return session data (for authenticated users)
              },
              "User registered and data saved successfully"
            )
          );
        });
    })
    .catch((err) => {
      // Catch unexpected errors
      console.error("Unexpected error:", err);
      return res
        .status(500)
        .json(new apiError(500, "Unexpected error occurred", [err]));
    });
});

const getUser = asyncHandler(async (req, res) => {
  const { supabase_id } = req.params; // Get the `supabase_id` from the URL params

  // Step 1: Query Supabase for the user based on supabase_id
  const { data, error } = await supabase.from("users").select("*"); // Get all user data
  // .eq('supabase_id', supabase_id)  // Match the supabase_id with the one passed in the request
  // .single();  // Assuming `supabase_id` is unique, use `.single()` to return one record

  // Step 2: Handle errors
  if (error) {
    console.log("Error fetching user data:", error);
    return res
      .status(400)
      .json(
        new apiError(400, "Error fetching user data: " + error.message, [error])
      );
  }

  // Step 3: Check if data was found
  if (!data) {
    return res.status(404).json(new apiError(404, "User not found", []));
  }

  // Step 4: Send the user data as a response
  return res
    .status(200)
    .json(new apiResponse(200, data, "User retrieved successfully"));
});

const loginUser01 = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // Get email and password from the request body

  // Step 1: Log the received login credentials (email)
  console.log("Email:", email);
  console.log("Password Length:", password.length); // Don't log the actual password for security

  // Step 2: Sign in the user using Supabase Authentication
  await supabase.auth
    .signIn({
      email,
      password,
    })
    .then(({ data, error }) => {
      // Step 3: Handle authentication errors
      if (error) {
        console.log("Authentication error occurred:", error);
        return res
          .status(400)
          .json(
            new apiError(400, "Authentication Error: " + error.message, [error])
          );
      }

      // Step 4: Check if user data is available
      if (!data.user) {
        return res.status(404).json(new apiError(404, "User not found", []));
      }

      // Step 5: Log and return user data and session
      console.log("User logged in successfully:", data.user);

      return res.status(200).json(
        new apiResponse(
          200,
          {
            user: data.user, // User details (id, email, etc.)
            session: data.session, // Session details (tokens)
          },
          "User logged in successfully"
        )
      );
    })
    .catch((err) => {
      // Catch unexpected errors
      console.error("Unexpected error:", err);
      return res
        .status(500)
        .json(new apiError(500, "Unexpected error occurred", [err]));
    });
});

const loginUser02 = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // Get email and password from the request body

  // Step 1: Log the received login credentials (email)
  console.log("Email:", email);
  console.log("Password Length:", password.length); // Don't log the actual password for security reasons

  // Step 2: Sign in the user using Supabase Authentication
  await supabase.auth
    .signInWithPassword({
      email,
      password,
    })
    .then(({ data, error }) => {
      // Step 3: Handle authentication errors
      if (error) {
        console.log("Authentication error occurred:", error);
        return res
          .status(400)
          .json(
            new apiError(400, "Authentication Error: " + error.message, [error])
          );
      }

      // Step 4: Check if user data is available
      if (!data.user) {
        return res.status(404).json(new apiError(404, "User not found", []));
      }

      // Step 5: Log and return user data and session
      console.log("User logged in successfully:", data.user);

      return res.status(200).json(
        new apiResponse(
          200,
          {
            user: data.user, // User details (id, email, etc.)
            session: data.session, // Session details (tokens)
          },
          "User logged in successfully"
        )
      );
    })
    .catch((err) => {
      // Catch unexpected errors
      console.error("Unexpected error:", err);
      return res
        .status(500)
        .json(new apiError(500, "Unexpected error occurred", [err]));
    });
});
const loginUser03 = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body; // Get phone number from the request body
    console.log("Phone Number:", phoneNumber); // Log the phone number for debugging purposes
  
    // Step 1: Check if the phone number exists in the database
    const { data, error } = await supabase
      .from("users")
      .select("phoneNumber")
      .eq("phoneNumber", phoneNumber)
      .single(); // Use .single() to fetch a single record
  
      console.log("Supabase response:", data, error); // Log the response for debugging
      
    // Step 2: Handle case where phone number is not found
    if (error || !data) {
      return res.status(404).json(new apiError(404, "Phone number not found", []));
    }
  
    console.log("User found:", data);
  
    // Step 3: Generate OTP and send it via Twilio WhatsApp
    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP
    const message = `Your OTP code is: ${generatedOtp}`;
  
    // Step 4: Send OTP to the user's phone number via WhatsApp
    await sendOtpToSms(phoneNumber, generatedOtp)
      .then(() => {
        // Step 5: Store the OTP and phone number temporarily (e.g., in session or cache)
        req.session.otp = generatedOtp; // You can use any session management or in-memory store
        req.session.phoneNumber = phoneNumber; // Store the phone number for OTP verification later
  
        return res.status(200).json(
          new apiResponse(200, { message: "OTP sent to your WhatsApp" }, "OTP sent successfully")
        );
      })
      .catch((twilioError) => {
        console.error("Twilio error:", twilioError);
        return res.status(500).json(new apiError(500, "Failed to send OTP via WhatsApp", [twilioError]));
      });
  });
  const loginUser04 = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body; // Get phone number from the request body
    console.log("Phone Number:", phoneNumber); // Log the phone number for debugging purposes
    const phoneNumberTrimmed = phoneNumber.trim(); // Trim leading/trailing spaces

    // Step 1: Check if the phone number exists in the database and fetch complete user data
    await supabase
      .from("users")
      .select("*")
      .eq("phoneNumber", phoneNumberTrimmed)
      .then(({ data, error }) => {
        console.log("Supabase response:", data, error); // Log the response for debugging
      
        
       // Use `.single()` to ensure only one record is returned
  
    // Step 2: Handle case where phone number is not found
    if (error || !data) {
      return res.status(404).json(new apiError(404, "Phone number not found", []));
    }
  
    console.log("User found:", data); // Log complete user data for debugging
  
    // Step 3: Generate OTP and send it via Twilio WhatsApp
    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP
    const message = `Your OTP code is: ${generatedOtp}`;
    console.log(generatedOtp);

})

    // Step 4: Send OTP to the user's phone number via WhatsApp
    // await sendOtpToWhatsApp(phoneNumber, generatedOtp)
    //   .then(() => {
    //     // Step 5: Store the OTP and phone number temporarily (e.g., in session or cache)
    //     req.session.otp = generatedOtp; // You can use any session management or in-memory store
    //     req.session.phoneNumber = phoneNumber; // Store the phone number for OTP verification later
  
    //     return res.status(200).json(
    //       new apiResponse(200, { message: "OTP sent to your WhatsApp", user: data }, "OTP sent successfully")
    //     );
    //   })
    //   .catch((twilioError) => {
    //     console.error("Twilio error:", twilioError);
    //     return res.status(500).json(new apiError(500, "Failed to send OTP via WhatsApp", [twilioError]));
    //   });
  });
  
  const loginUser05 = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body; // Get phone number from the request body
    console.log("Phone Number:", phoneNumber); // Log the phone number for debugging purposes
  
    // Step 1: Check if the phone number exists in the database and fetch complete user data
    const { data, error } = await supabase
      .from("users")
      .select("*") // Fetch all user data
      .eq("phoneNumber", phoneNumber)
      .single(); // Use .single() to ensure only one record is returned
  
    // Step 2: Handle case where phone number is not found
    if (error || !data) {
      return res.status(404).json(new apiError(404, "Phone number not found", []));
    }
  
    console.log("User found:", data); // Log complete user data for debugging
  
    // Step 3: Generate OTP and send it via SMS
    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP
    const message = `Your OTP code is: ${generatedOtp}`;
  
    // Step 4: Send OTP to the user's phone number via SMS
    await sendOtpToSms(phoneNumber, generatedOtp)
      .then(() => {
        // Step 5: Store the OTP and phone number temporarily (e.g., in session or cache)
        req.session.otp = generatedOtp; // Store OTP in the session
        req.session.phoneNumber = phoneNumber; // Store phone number for later OTP verification
  
        return res.status(200).json(
          new apiResponse(200, { message: "OTP sent via SMS" }, "OTP sent successfully")
        );
      })
      .catch((twilioError) => {
        console.error("Twilio error:", twilioError);
        return res.status(500).json(new apiError(500, "Failed to send OTP via SMS", [twilioError]));
      });
  });

  const loginUser = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body; // Get phone number from the request body
    console.log("Phone Number:", phoneNumber); // Log the phone number for debugging purposes
  
    // Step 1: Check if the phone number exists in the database and fetch complete user data
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phoneNumber", phoneNumber)
      .single(); // Use .single() to ensure only one record is returned
  
    // Step 2: Handle case where phone number is not found
    if (error || !data) {
      return res.status(404).json(new apiError(404, "Phone number not found", []));
    }

    // Step 3: Generate OTP and send it via SMS
    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // Random 6-digit OTP
  
    // Send OTP to the user's phone number via SMS
    await sendOtpToSms(phoneNumber, generatedOtp)
      .then(() => {
        // Step 4: Store the OTP and phone number temporarily (e.g., in session or cache)
        req.session.otp = generatedOtp;
        req.session.phoneNumber = phoneNumber; // Store phone number for later OTP verification
  
        return res.status(200).json(
          new apiResponse(200, { message: "OTP sent via SMS" }, "OTP sent successfully")
        );
      })
      .catch((twilioError) => {
        console.error("Twilio error:", twilioError);
        return res.status(500).json(new apiError(500, "Failed to send OTP via SMS", [twilioError]));
      });
  });
  // Step 5: OTP Verification and User Login
  const verifyOtpAndLogin = asyncHandler(async (req, res) => {
    const { otp } = req.body; // Get OTP from the request body
  
    // Step 1: Check if the OTP exists in the session
    if (!req.session || !req.session.otp) {
      return res.status(400).json(new apiError(400, "OTP not found in session", []));
    }
  
    // Step 2: Check if the OTP entered by the user matches the one stored in session
    if (req.session.otp !== otp) {
      return res.status(400).json(new apiError(400, "Invalid OTP", []));
    }
  
    // Step 3: OTP is correct. Now authenticate the user.
    const { phoneNumber } = req.session; // Get the phone number from session
  
    // Fetch user data from the database based on the phone number
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phoneNumber", phoneNumber)
      .single(); // Use .single() to get only one record
  
    if (error || !data) {
      return res.status(404).json(new apiError(404, "User not found", []));
    }
  
    // Step 4: Clear OTP from session after successful login
    req.session.otp = null; // Clear OTP from session
  
    // Step 5: Respond with the user details and session information
    return res.status(200).json(
      new apiResponse(200, { user: data, message: "User logged in successfully" }, "Login successful")
    );
  });
  

export { registerUser, getUser, loginUser,verifyOtpAndLogin };
/* 
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access or refresh token")
    }

}

const registerUser = asyncHandler(async (req, res) => {
    // get the user details from the frontend
    const { username, fullName, email, password } = req.body
    // console.log("email ", email);

    // validation - not empty
    if ([username, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields required")
    }

    // check user is exist using email, username
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new apiError(409, "User with Username or email already exist ")
    }

    // check for images and check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar image is required")
    }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new apiError(400, "Avatar file is required ")
    }

    // create user object - create entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),




    })

    // remove password and refresh token from the response
    // check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    // return response
    return res.status(201).json(
        // {createdUser}
        new apiResponse(200, createdUser, "User Registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // req boy data
    const { email, username, password } = req.body

    // username or email login
    // console.log(`${email} ${password}`);
    if (!username || !email) {
        throw new apiError(400, "email or username required")
    }

    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiError(404, "user does'nt exist")
    }

    // password check

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid User credentials password incorrect")
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    // send to cookies 
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(200, {}, "user logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new apiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(400, "Refresh Token os expired or used ")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        accessToken, newRefreshToken
                    },
                    "Access Token refreshed successfully"
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }



})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
    
*/
