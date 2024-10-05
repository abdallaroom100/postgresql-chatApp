import express from "express";
import authRoute from "../router/auth.routes.js";
import messageRoute from "../router/messages.routes.js";
import dotenv from "dotenv"
const app = express();

export const startApp =  () => {
  /**
   * apply middlewares
  */
 
 dotenv.config()
  app.use(express.json())
  app.use("/api/auth/", authRoute)
  app.use("/api/messages/", messageRoute)

  /**
   * connect to the server
  */
 app.listen(5000, () => { 
    console.log("server is connected ");
  });
};

