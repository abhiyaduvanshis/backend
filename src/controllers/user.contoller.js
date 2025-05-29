import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmailToUser } from "../utils/sendEmail.js";
import { forgetPasswordEmail } from "../utils/sendForgetEmail.js";
import jwt from "jsonwebtoken"

const getGenrateAccessRefreshToken = async(userId) =>{
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,'Something went wrong while generating referesh and access toke')
    }
}

const userRegister = asyncHandler( async (req, res) => {

    const {fullName, email, username, password,role,status } = req.body

    if([fullName, email, username, password,role].some(field => !field?.trim())){
        return res
        .status(400)
        .json(
            new ApiError(400, "All fields are required")
        )
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    

    if(existedUser){
        return res
        .status(409)
        .json(
            new ApiError(409, "User with email or username already exists")
        )
    }

    const avatarPath = req.files?.avatar[0]?.path

    const coverImagePath=req.files?.coverImage[0]?.path

    const avatar= await uploadOnCloudinary(avatarPath)

    const coverImage= await uploadOnCloudinary(coverImagePath)

    if(!avatar){
        return res
        .status(400)
        .json(
            new ApiError(400, "Avatar file is required")
        )
    }

    const user = await User.create({
        username:username.toLowerCase(),
        email,
        fullName,
        avatar:avatar?.url,
        coverImage:coverImage?.url || "",
        password,
        role: role || 'user',
        status
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res
        .status(500)
        .json(
            new ApiError(500, "Something went wrong while registering the user")
        )
    }
    const test = await sendEmailToUser(createdUser)
    if(test){
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
    }else{
         return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully but verfication mail not send to user")
        )
    }
    
})


const userLogin = asyncHandler( async (req, res) => {
    const {username,email,password} = req.body

    if((!email || !username) && !password){
        return res
        .status(401)
        .json(
            new ApiError(401,"All field are required!")
        )
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        return res
        .status(404)
        .json(
            new ApiError(404,'User not exist')
        )
    }

    const checkPassword = await user.isPasswordCorrect(password)

    if(!checkPassword){
        return res
        .status(401)
        .json(
            new ApiError(401,"Invalid user credentials")
        )
    }
    const {accessToken,refreshToken} = await getGenrateAccessRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
             "User logged In Successfully"
        )
    )
})

const userLogout = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
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
    .cookie("accessToken",  options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logout  Successfully"
        )
    )
})

const refreshAccessToken = asyncHandler( async(req,res) =>{

    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken 

    if(!getRefreshToken){
        throw new ApiError(401,'unauthorized request')
    }

    try {
        const decodeRefreshToken = await jwt.verify(getRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user  = await User.findById(decodeRefreshToken?._id)

        if(!user){
            throw new ApiError(404,'User not exist')
        }

        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changePassword = asyncHandler( async(req,res)=>{
    try {
        const {oldPassword,newPassword} = req.body
        const user = await User.findById(req.user?._id)
        const checkOldPassword = await user.isPasswordCorrect(oldPassword)

        if(!checkOldPassword){
            throw new ApiError(401, "Invalid old password")
        }

        user.password = newPassword
        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
    } catch (error) {
         throw new ApiError(401, error?.message || "Invalid old password")
    }
})

const forgetPassword = asyncHandler( async(req,res)=>{
    try {
        const {username,email} = req.body

        if(!username && !email){
            return res
            .status(401)
            .json(
                new ApiError(401, "Username Or Email are required")
            )
        }

        const user = await User.findOne({
            $or:[{username},{email}]
        })

        if(!user){
            return res
            .status(404)
            .json(
                new ApiError(404, "User not exist!")
            )
        }

        const token = jwt.sign(
            {
                email: email,

            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_FORGOT_TOKEN_EXPIRY
            }
        )

        const userData = {
            fullName:user?.fullName,
            email:user?.email,
            reset_link:'http://localhost:3000/reset-password/'+token
        }

        const sendEmail= await forgetPasswordEmail(userData)

        if(sendEmail){
            return res.status(201).json(
                new ApiResponse(200, '', "Password reset link sent to your email")
            )
        }else{
            return res
            .status(401)
            .json(
                new ApiError(401, "email faild!")
            )
        }

    }catch(error) {
        throw new ApiError(401, error?.message || "Invalid old password") 
    }
})

const resetPassword = asyncHandler(async(req,res)=>{
    try {

        const user = req?.user
        const {password} = req.body
        user.password = password

        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid old password")

    }
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    try {
        const user = await User.findById(req.user?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(404, "User not found")
        }
        return res
        .status(200)
        .json(new ApiResponse(200, user , "Current user data"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid old password")
    }
})


export {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changePassword,
    forgetPassword,
    resetPassword,
    getCurrentUser
}