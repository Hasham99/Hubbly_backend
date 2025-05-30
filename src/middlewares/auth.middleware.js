import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new apiError(401, "UnAuthorized Request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decodedToken);
        
        const user = await User.findById(decodedToken?.id).select(" -refreshToken")
        // console.log(user);
        
        if (!user) {
            throw new apiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid AccessToken")
    }
})  