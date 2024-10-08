import { Request, Response } from "express";
import prisma from "../../db/prisma.js";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.userId;

    // if the receiver id and sender id is same that mean the user is sending messages for him!
    if (senderId == receiverId)
      throw new Error("you cant send messages for yourself");

    // check first if there is conversation between the sender and receiver or not
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantsIds: {
          hasEvery: [receiverId, senderId],
        },
      },
    });
    // if there is not covnersation has started before between the both users make a new conversation for them
    if (!conversation)
      await prisma.conversation.create({
        data: {
          participantsIds: {
            set: [receiverId, senderId],
          },
        },
      });

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation!.id,
      },
    });

    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation?.id,
        },
        data: {
          messages: {
            connect: {
              id: newMessage.id,
            },
          },
        },
      });
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in send message function ");
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCurrentChatMessages = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.userId;
    console.log(senderId, receiverId);
    let covnersation = await prisma.conversation.findFirst({
      where: {
        participantsIds: {
          hasEvery: [receiverId, senderId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    if (!covnersation)
      covnersation = await prisma.conversation.create({
        data: {
          participantsIds: {
            set: [senderId, receiverId],
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    res.status(201).json(covnersation);
  } catch (error) {
    console.log("error in  get current chat messages function");
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    const conversations = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        profilePic: true,
        fullName: true,
      },
    });
    if (!conversations) {
      throw new Error("users not found");
    }
    res.status(200).json(conversations);
  } catch (error) {
    console.log("error in get all conversations function ");
    res.status(400).json({ error: (error as Error).message });
  }
};
 