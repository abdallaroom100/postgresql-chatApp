import express, { Router } from "express"
import {login,signup,logout, getCurrentUser} from "../controllers/auth/index.js"
import { protectRoute } from "../middleware/protectedRoute.js"
const router:Router = express.Router()


/**
 * define auth routes
 */

router.get("/me",protectRoute,getCurrentUser)
router.post("/signup",signup)

router.post("/login",login)

router.post("/logout",logout)


export default router
