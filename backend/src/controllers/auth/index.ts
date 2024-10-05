import { Request, Response } from "express";
import prisma from "../../db/prisma.js";
import bcrypt from "bcryptjs";
import generateToken from "../../utils/generateToken.js";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
const validateRequiredFields = (fields: string[], body: any) => {
  for (const field of fields)
    if (!body[field])
      throw new Error(`${field} is missing, please fill all required fields`);
};

export const signup = async (req: Request, res: Response) => {
  const { fullName, username, password, confirmPassword, gender } = req.body;
  try {
    validateRequiredFields(
      ["fullName", "username", "password", "confirmPassword", "gender"],
      req.body
    );
    /**
     * check if username is exist in db or not
     */
    const user = await prisma.user.findUnique({
      where: { username: `${username}` },
    });
    if (user) throw new Error("username is alredy exists");

    /**
     * check all user fields
     */

    if (password !== confirmPassword)
      throw new Error("confirm password is not match");

    if (gender != "female" && gender != "male")
      throw new Error("why are you gay?");

    // if user is male then set the default picture to man photo if female then ...
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
    let profilePic = gender === "male" ? boyProfilePic : girlProfilePic;

    // hash the password
    const hash = bcrypt.hashSync(password, 10);

    // creating new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hash,
        fullName,
        gender,
        profilePic,
      },
    });
    generateToken(newUser.id, res);
    res.status(200).json({ id: newUser.id, username, profilePic, fullName });
  } catch (error) {
    console.log("error in sign up");
    res.status(401).json({ error: (error as Error).message });
  }
};

// login route
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    validateRequiredFields(["username", "password"], req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error("this username is not exist");

    // compare the user hashed password with the given password
    const vPassword = bcrypt.compareSync(password, user.password);
    if (!vPassword) throw new Error("invalid credentials");

    generateToken(user.id, res);
    res.status(200).json({
      id: user.id,
      username,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("error in login");
    res.status(400).json({ error: (error as Error).message });
  }
};

// logout route
export const logout = async (req: Request, res: Response) => {
  try {
    res
      .cookie("jwt", "", {
        maxAge: 0,
      })
      .json("user logged out successfully");
  } catch (error) {
    console.log("error in logout");
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    console.log("yes")
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        profilePic: true,
      },
    });
    if (!user) throw new Error("user is not found");
    res.status(200).json(user);
  } catch (error) {
    console.log("error in get current user function");
    res.status(400).json({ error: (error as Error).message });
  }
};

