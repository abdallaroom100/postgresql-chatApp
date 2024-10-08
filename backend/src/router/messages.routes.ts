import express, { Router } from "express"
import { protectRoute } from "../middleware/protectedRoute.js"
import { getAllConversations, getCurrentChatMessages, sendMessage } from "../controllers/message/index.js"

const router:Router = express.Router()

router.get("/conversations",protectRoute,getAllConversations)
router.post("/send/:id",protectRoute,sendMessage)
router.get("/:id",protectRoute,getCurrentChatMessages)
// router.post()

export default router
// Todo: add socket.io to the server 
// Todo : configure this server for te deployment
// at leaset for now 