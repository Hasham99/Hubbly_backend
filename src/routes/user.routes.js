import { Router } from "express";
// import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { findMatches, getUploadedFiles, getUser, getUserById , getUsersWhoLikedMe, likeUser, loginRegisterUser, loginUser, registerUser, registerUserFileUpload, unlikeUser, updateUser, uploadTestFile, verifyOtp } from "../controllers/user.controller.js";

// const { auth } = require('express-openid-connect');

const router = Router();


// router.route("/auth0").get((req, res) => {
//     res.send("api is working 'Wrong Path'")
// })

// router.route("/auth/register").post(registerUser);
router.route("/auth/register-not-cloudinary").post(upload.fields([
    { name: 'photo', maxCount: 1 },  // User photo
    { name: 'mother_photo', maxCount: 1 },  // Mother photo
    { name: 'father_photo', maxCount: 1 },  // Father photo
    { name: 'sibling_photos', maxCount: 10 }  // Multiple sibling photos (adjust count as needed)
]),
registerUser
);

router.route("/auth/register").post(upload.fields([
    { name: 'photo', maxCount: 1 },  // User photo
    { name: 'mother_photo', maxCount: 1 },  // Mother photo
    { name: 'father_photo', maxCount: 1 },  // Father photo
    { name: 'sibling_photos', maxCount: 10 }  // Multiple sibling photos (adjust count as needed)
]),
registerUserFileUpload
);

router.route("/test-upload").post(upload.fields([
    { name: 'file', maxCount: 1 }  // file upload 
]),
uploadTestFile
);
router.route("/test-upload").get(getUploadedFiles);
// router.all('*', (req, res) => {
//     res.status(404).send('Route not found');
//   });
// POST endpoint for registering the user, including photo uploads
// router.post('/users/register',
//     upload.fields([
//         { name: 'photo', maxCount: 1 },  // User photo
//         { name: 'mother_photo', maxCount: 1 },  // Mother photo
//         { name: 'father_photo', maxCount: 1 },  // Father photo
//         { name: 'sibling_photos', maxCount: 10 }  // Multiple sibling photos (adjust count as needed)
//     ]),
//     registerUser
// );
router.route("/auth/login").post(loginUser);
router.route("/auth/new-login").post(loginRegisterUser);
router.route("/auth/verify-otp").post(verifyOtp);

router.route("/find").get(verifyJWT, findMatches);
router.route("/update").put(verifyJWT, updateUser);
router.route("/like").patch(verifyJWT, likeUser);
router.route("/unlike").patch(verifyJWT, unlikeUser);
router.route("/liked-me").get(verifyJWT, getUsersWhoLikedMe);

router.route("/get").get(getUser);
router.route("/get/:userId").get(getUserById);

// router.route("/register").post(
//     upload.fields([
//         {
//             name: "avatar",
//             maxCount: 1

//         },
//         {
//             name: "coverImage",
//             maxCount: 1

//         }
//     ]),
//     registerUser
// );

// router.route("/login").post(loginUser)

// secured routes

// router.route("/logout").post(verifyJWT, logoutUser)

// router.route("/refresh-token").post(refreshAccessToken)


export default router;