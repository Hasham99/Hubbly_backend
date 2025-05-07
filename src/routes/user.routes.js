import { Router } from "express";
// import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getUser, loginUser, registerUser } from "../controllers/user.controller.js";

const router = Router();


router.route("/").get((req, res) => {
    res.send("api is working 'Wrong Path'")
})

// router.route("/auth/register").post(registerUser);
router.route("/auth/register").post(upload.fields([
    { name: 'photo', maxCount: 1 },  // User photo
    { name: 'mother_photo', maxCount: 1 },  // Mother photo
    { name: 'father_photo', maxCount: 1 },  // Father photo
    { name: 'sibling_photos', maxCount: 10 }  // Multiple sibling photos (adjust count as needed)
]),
registerUser
);

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

router.route("/get").get(getUser);

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