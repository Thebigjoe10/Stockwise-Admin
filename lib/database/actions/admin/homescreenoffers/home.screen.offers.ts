"use server";

import { connectToDatabase } from "@/lib/database/connect";
import HomeScreenOffer from "@/lib/database/models/home.screen.offers";
import { v2 as cloudinary } from "cloudinary";

// ✅ Centralized config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
});

// Utility: always fetch latest offers
const fetchOffers = async () => {
  const offers = await HomeScreenOffer.find().sort({ updatedAt: -1 });
  return JSON.parse(JSON.stringify(offers));
};

// ✅ Create offer
export const createOffer = async (
  title: string,
  offerType: string,
  images: string[]
) => {
  try {
    await connectToDatabase();

    if (!title?.trim()) {
      return { message: "Please provide a title for the offer.", success: false };
    }

    // Check duplicate
    const existingOffer = await HomeScreenOffer.findOne({ title: title.trim() });
    if (existingOffer) {
      return { message: "Offer with this title already exists.", success: false };
    }

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      images.map((img) =>
        cloudinary.uploader.upload(img, { folder: "offers" }) // base64 works directly
      )
    );

    const imageUrls = uploadedImages.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    const newOffer = new HomeScreenOffer({ title: title.trim(), offerType, images: imageUrls });
    await newOffer.save();

    return {
      message: `Offer "${title}" has been successfully created.`,
      success: true,
      offers: await fetchOffers(),
    };
  } catch (error: any) {
    console.error("Error creating offer:", error.message);
    return { message: "Error creating offer.", success: false };
  }
};

// ✅ Delete offer
export const deleteOffer = async (offerId: string) => {
  try {
    await connectToDatabase();

    const offer = await HomeScreenOffer.findById(offerId);
    if (!offer) return { message: "Offer not found.", success: false };

    // Delete all images
    await Promise.all(offer.images.map((img: any) => cloudinary.uploader.destroy(img.public_id)));

    await HomeScreenOffer.findByIdAndDelete(offerId);

    return {
      message: "Successfully deleted offer and associated images.",
      success: true,
      offers: await fetchOffers(),
    };
  } catch (error: any) {
    console.error("Error deleting offer:", error.message);
    return { message: "Error deleting offer.", success: false };
  }
};

// ✅ Get all offers
export const getAllOffers = async () => {
  try {
    await connectToDatabase();
    return {
      offers: await fetchOffers(),
      message: "Successfully fetched all offers.",
      success: true,
    };
  } catch (error: any) {
    console.error("Error fetching offers:", error.message);
    return { message: "Error fetching offers.", success: false };
  }
};

// ✅ Update offer (with optional image updates)
export const updateOffer = async (
  offerId: string,
  newTitle: string,
  newOfferType: string,
  newImages: string[] = [], // base64 strings for new images
  replaceImages: boolean = false // if true → replace old images, if false → append
) => {
  try {
    await connectToDatabase();

    const offer = await HomeScreenOffer.findById(offerId);
    if (!offer) return { message: "Offer not found.", success: false };

    if (!newTitle?.trim()) {
      return { message: "Title cannot be empty.", success: false };
    }

    // ✅ Upload new images if provided
    let uploadedImages: { url: string; public_id: string }[] = [];
    if (newImages.length > 0) {
      uploadedImages = await Promise.all(
        newImages.map((img) =>
          cloudinary.uploader.upload(img, { folder: "offers" })
        )
      ).then((results) =>
        results.map((img) => ({ url: img.secure_url, public_id: img.public_id }))
      );
    }

    if (replaceImages && newImages.length > 0) {
      if (offer.images.length > 0) {
        await Promise.all(
          offer.images.map((img: any) => cloudinary.uploader.destroy(img.public_id))
        );
      }
      offer.images = uploadedImages;
    } else if (newImages.length > 0) {
      // ➕ Append new images
      offer.images = [...offer.images, ...uploadedImages];
    }

    // Update text fields
    offer.title = newTitle.trim();
    offer.offerType = newOfferType;

    await offer.save();

    return {
      message: "Successfully updated the offer!",
      success: true,
      offers: await fetchOffers(),
    };
  } catch (error: any) {
    console.error("Error updating offer:", error.message);
    return { message: "Error updating offer.", success: false };
  }
};
