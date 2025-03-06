import { Request, Response } from "express";
import User from "../models/user";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv'; 
import { v4 as uuidv4 } from "uuid";

dotenv.config();


// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const addIntakeForm = async (
  req: Request & { user: { _id: string } },
  res: Response
) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user._id;
    const { originalname, buffer, mimetype } = req.file; // Extract file info

    // Generate a unique filename
    const fileName = `${uuidv4()}-${originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || "default-bucket-name",
      Key: fileName,
      Body: buffer, // Use the buffer from multer
      ContentType: mimetype, // Use actual file type
    };


    const uploadCommand = new PutObjectCommand(params);
    const data = await s3Client.send(uploadCommand);

    // Construct S3 file URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    // Update user with new form details
    const formDetails = {
      name: originalname,
      created_at: new Date(),
      s3_url: fileUrl,
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { forms: formDetails } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Form uploaded successfully",
      fileUrl,
      user,
    });
  } catch (err) {
    console.error("Error uploading form:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
