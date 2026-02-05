import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../constants/env";
import sharp from "sharp";
import { resolve } from "node:dns";
import appAssert from "../../utils/appAssert";
import { INTERNAL_SERVER_ERROR } from "../../constants/http";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "waste-images",
): Promise<string> => {
  try {
    const optimizedBuffer = await sharp(fileBuffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || "");
          }
        },
      );
      uploadStream.end(optimizedBuffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    appAssert(
      false,
      INTERNAL_SERVER_ERROR,
      "Failed to upload image to Cloudinary",
    );
  }
};

export const deleteImageFromCloudinary = async (
  publicId: string,
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    appAssert(
      false,
      INTERNAL_SERVER_ERROR,
      "Failed to delete image from Cloudinary",
    );
  }
};
