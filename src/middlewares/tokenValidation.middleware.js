import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const tokenValidator = asyncHandler(async(req,res,next)=>{
    try{
        const token =  req.params.token
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findOne({email:decodeToken?.email}).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
            throw new ApiError(401, error?.message || "Invalid access token")
    }
}) 