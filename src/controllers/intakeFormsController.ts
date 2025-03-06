import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // You can specify region if needed
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const addIntakeForm = async (
  req: Request & { user: { _id: string } },
  res: Response
) => {
  const userId = req.user._id; // Assuming req.user is populated by middleware
  const { formName, formData } = req.body; // formData should be the file data

  try {
    // Generate a unique filename
    const fileName = `${uuidv4()}-${formName}`;

    // Upload form to S3 using the AWS SDK v3 (PutObjectCommand)
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || "default-bucket-name", // Default bucket name if not provided
      Key: fileName,
      Body: formData,
      ContentType: "application/pdf", // Adjust content type as needed
    };

    const uploadCommand = new PutObjectCommand(params);
    const uploadResult = await s3Client.send(uploadCommand);

    // Update user with new form
    const formDetails = {
      name: formName,
      created_at: new Date(),
      s3_url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`, // Construct URL for S3 object
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
      message: "Form added successfully",
      user,
    });
  } catch (err) {
    console.error("Error adding form:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
