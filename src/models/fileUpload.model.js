import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const FileUpload = mongoose.model("FileUpload", fileUploadSchema);
