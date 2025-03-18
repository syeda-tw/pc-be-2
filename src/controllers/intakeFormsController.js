import User from "../models/user.js";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";

dotenv.config();

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const addIntakeForm = async (req, res) => {
  try {
    // Validate request
    if (!req.file || !req.body.formName) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user._id;
    const { buffer, mimetype } = req.file;

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ message: "Invalid file content" });
    }

    // Generate unique ID and filename
    const _id = uuidv4();
    const fileNa75974me = `${_id}.pdf`;

    // **Upload to S3**
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: req.body.formName,
      Body: buffer,
      ContentType: mimetype || "application/pdf",
    };

    await s3Client.send(new PutObjectCommand(params));

    // Construct file URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${req.body.formName}`;

    // Update user with new form details
    const formDetails = {
      _id: req.body.formName,
      name: req.body.formName,
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
      form: formDetails,
    });
  } catch (err) {
    console.error("🚨 Error uploading form:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getIntakeForms = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user by ID and select the forms field
    const user = await User.findById(userId).select("forms");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User forms retrieved successfully",
      forms: user.forms,
    });
  } catch (err) {
    console.error("Error retrieving user forms:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleIntakeForm = async (req, res) => {
  try {
    const userId = req.user._id;
    const { formId } = req.params;

    // Find the user by ID and select the forms field
    const user = await User.findById(userId).select("forms");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const form = user.forms.find((form) => form._id === formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Get the file from S3
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || "default-bucket-name",
      Key: formId,
    };

    const s3Object = await s3Client.send(new GetObjectCommand(s3Params));

    if (!s3Object.Body) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve file from S3" });
    }

    const fileStream = Readable.from(s3Object.Body);

    // Set headers for the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${form.name || "file"}"`
    );

    // Pipe the Readable stream to the response
    fileStream.pipe(res);

    // Handle any errors from the stream
    fileStream.on("error", (err) => {
      res
        .status(500)
        .json({ error: "Failed to stream PDF", details: err.message });
    });
  } catch (err) {
    console.error("Error retrieving form:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const userId = req.user._id;
    const { formId } = req.params; // Assuming formId is passed as a URL parameter

    // Find the user by ID and select the forms field
    const user = await User.findById(userId).select("forms");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the form by ID
    const form = user.forms.find((form) => form._id === formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Delete the file from AWS S3
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || "default-bucket-name",
      Key: form.s3_url.split("/").pop(), // Extract the file name from the URL
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3Client.send(deleteCommand);

    // Remove the form from the user's forms list
    await User.findByIdAndUpdate(
      userId,
      { $pull: { forms: { _id: formId } } },
      { new: true }
    );

    return res.status(200).json({ message: "Form deleted successfully" });
  } catch (err) {
    console.error("Error deleting form:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
