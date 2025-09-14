"use server";

import { v2 as cloudinary } from "cloudinary";
import {base64ToBuffer} from "@/utils"

// ✅ Centralized config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
});

type BannerType = "website_banners" | "app_banners";

interface UploadedImage {
  url: string;
  public_id: string;
  tags?: string[];
}


/**
 * Generic: Upload images to Cloudinary with a specific tag
 */
export const uploadBannerImages = async (
  images: string[],
  type: BannerType
): Promise<{ imageUrls: UploadedImage[] }> => {
  const imageUploadPromises = images.map(async (base64Image) => {
    const buffer = base64ToBuffer(base64Image);

    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: "image/jpeg" }));
    formData.append("upload_preset", "website"); // 🔧 Consider making this env-based
    formData.append("tags", type);
    formData.append("public_id", `${type}_${Date.now()}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  });

  const uploadedImages = await Promise.all(imageUploadPromises);

  return {
    imageUrls: uploadedImages.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
      tags: img.tags,
    })),
  };
};

/**
 * Generic: Fetch all banners by tag
 */
export const fetchAllBanners = async (type: BannerType) => {
  try {
    const result = await cloudinary.api.resources_by_tag(type, {
      type: "upload",
      max_results: 100,
    });
    return result.resources;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
};

/**
 * Delete banner by Cloudinary publicId
 */
export const deleteBannerById = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return {
      success: result.result === "ok",
      message:
        result.result === "ok"
          ? "Successfully deleted image."
          : result.result,
    };
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};
