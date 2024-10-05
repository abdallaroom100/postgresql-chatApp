import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db/prisma.js";

interface DecodedToken extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    export interface Request {
      userId:string
    }
  }
}
// export const protectRoute   = async (req:Request,res:Response,next:NextFunction)=>{
//     try {
//         const token = req.headers.cookie?.split("=")[1];

//         if (!token) throw new Error("invalid token or there is no users");
//           jwt.verify(
//           token,
//           process.env.JWT_SECRET!,
//           (err, encode) => {
//             if (err) throw new Error("invalid user token");

//             else {
//             (req as any).userId= (encode as any).userId
//             next()
//             }
//           }
//         );
//       } catch (error) {
//         console.log("error in protect route function");
//         res.status(400).json({ error: (error as Error).message });
//       }
// }
export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.cookie?.split("=")[1];
    if (!token) throw new Error("unaturhorized token");
    const decode = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    if (!decode) throw new Error("unaturhorized - invalid token");
    req.userId = decode.userId;
    next()
  } catch (error) {
    console.log("error in protect route function");
    res.status(400).json({ error: (error as Error).message });
  }
};
//
