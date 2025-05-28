import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changePassword,
    forgetPassword,
    resetPassword,
    getCurrentUser
} from "../controllers/user.contoller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { tokenValidator } from "../middlewares/tokenValidation.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    userRegister
)

router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT,userLogout)
router.route("/refresh-access-token").post(verifyJWT,refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/forget-password").post(forgetPassword)
router.route("/reset-password/:token").post(tokenValidator,resetPassword)
router.route("/get-current-user").post(verifyJWT,getCurrentUser)

export default router