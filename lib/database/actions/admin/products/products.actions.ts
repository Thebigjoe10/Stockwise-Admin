"use server";
import { connectToDatabase } from "@/lib/database/connect";
import Category from "@/lib/database/models/category.model";
import Product from "@/lib/database/models/product.model";
import slugify from "slugify";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { User } from "lucide-react";
const { ObjectId } = mongoose.Types;

// config our Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// creation of a product for admin
export const createProduct = async (
  sku: string,
  color: any,
  images: [],
  sizes: Array<{ size: string; qty: string; price: string }>,
  discount: number,
  name: string,
  description: string,
  longDescription: string,
  brand: string,
  details: Array<{ name: string; value: string }>,
  questions: Array<{ question: string; answer: string }>,
  category: string,
  subCategories: string[],
  benefits: Array<{ name: string }>,
  ingredients: Array<{ name: string }>,
  parent: string,
  featured: boolean
) => {
  try {
    await connectToDatabase();

    if (parent) {
      const Parent: any = await Product.findById(parent);
      if (!Parent) {
        return {
          message: "Parent not found!",
          success: false,
        };
      } else {
        await Parent.updateOne(
          {
            $push: {
              subProducts: {
                sku,
                color,
                images,
                sizes,
                discount,
              },
            },
          },
          { new: true }
        );
        return {
          message: "Sub-product added successfully.",
          success: true,
        };
      }
    } else {
      const slug = slugify(name);
      const newProduct = new Product({
        name,

        description,
        longDescription,
        brand,
        details,
        questions,
        slug,
        category,
        benefits,
        ingredients,
        subCategories,
        subProducts: [
          {
            sku,
            color,
            images,
            sizes,
            discount,
          },
        ],
        featured,
      });
      await newProduct.save();
      return {
        message: "Product created successfully.",
        success: true,
      };
    }
  } catch (error: any) {
    console.log(error);
    return {
      message: error,
      success: false,
    };
  }
};

// delete single product for amdin
export const deleteProduct = async (productId: string) => {
  try {
    await connectToDatabase();
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return {
        message: "Product not found with this Id!",
        success: false,
      };
    }
    return {
      message: "Product Successfully deleted!",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
  }
};

// update single product for admin
export const updateProduct = async (
  productId: string,
  sku: string,
  color: string,
  sizes: Array<{ size: string; qty: string; price: string }>,
  discount: number,
  name: string,
  description: string,
  brand: string,
  details: Array<{ name: string; value: string }>,
  questions: Array<{ question: string; answer: string }>,
  benefits: Array<{ name: string }>,
  ingredients: Array<{ name: string }>,
  longDescription: string
) => {
  try {
    await connectToDatabase();

    const product = await Product.findOne({
      _id: productId,
    });
    if (!product) {
      return {
        message:
          "Product not found or you don't have permission to edit this product.",
      };
    }
    if (!product.color) {
      product.color = {};
    }
    product.name = name;
    product.slug = slugify(name);
    product.subProducts[0].sku = sku;
    product.subProducts[0].color.color = color;
    product.sizes = sizes;
    product.subProducts[0].discount = discount;
    product.description = description;
    product.brand = brand;
    product.details = details;
    product.questions = questions;
    product.benefits = benefits;
    product.ingredients = ingredients;
    product.longDescription = longDescription;

    await product.save();
    return {
      success: true,
      message: "Product updated successfully",
      product: JSON.parse(JSON.stringify(product)),
    };
  } catch (error: any) {
    console.log(error);
  }
};

// get single product by ID for admin
export const getSingleProductById = async (
  id: string,
  style?: number,
  size?: any
) => {
  try {
    await connectToDatabase();
    if (!style) {
      style = 0;
    }
    if (!size) {
      size = 0;
    }
    const product: any = await Product.findById(id).lean();
    const discount = product.subProducts[style].discount;
    const priceBefore = product.subProducts[style].sizes[size].price;
    const price = discount ? priceBefore - priceBefore / discount : priceBefore;
    return JSON.parse(
      JSON.stringify({
        success: true,
        _id: product._id.toString(),
        style: Number(style),
        name: product.name,
        discount,
        sizes: product.subProducts[style],
        description: product.description,
        longDescription: product.longDescription,
        slug: product.slug,
        sku: product.subProducts[style].sku,
        brand: product.brand,
        category: product.category,
        subCategories: product.subCategories,
        shipping: product.shipping,
        images: product.subProducts[style].images,
        color: product.subProducts[style].color,
        size: product.subProducts[style].sizes[size].size,
        price,
        priceBefore,

        quantity: product.subProducts[style].sizes[size].qty,
      })
    );
  } catch (error: any) {
    console.log(error);
  }
};

// get all products for admin
export const getAllProducts = async () => {
  try {
    await connectToDatabase();

    const products = await Product.find()
      .sort({ updateAt: -1 })
      .populate({ path: "category", model: Category })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error: any) {
    console.log(error);
  }
};

// get product by id
export const getEntireProductById = async (id: string) => {
  try {
    await connectToDatabase();
    const product = await Product.findById(id);
    if (!product) {
      return {
        message: "Product not found with this Id",
        product: [],
        success: false,
      };
    }
    return {
      product: JSON.parse(JSON.stringify(product)),
      message: "Successfully found product",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
  }
};

// get parents and categories
export const getParentsandCategories = async () => {
  try {
    await connectToDatabase();
    const results = await Product.find().select("name subProducts").lean();
    const categories = await Category.find().lean();
    return {
      success: true,
      parents: JSON.parse(JSON.stringify(results)),
      categories: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error: any) {
    console.log(error);
  }
};

// switch featured product:
export const switchFeaturedProduct = async (
  productId: string,
  value: boolean
) => {
  try {
    await connectToDatabase();
    const product = await Product.findByIdAndUpdate(productId, {
      featured: value,
    });
    if (!product) {
      return {
        message: "Can't find Product with this ID.",
        success: false,
      };
    }
    return {
      message: "Successfully updated product",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
  }
};

// get latest created product reviews:
export const getLatestProductReviews = async () => {
  try {
    await connectToDatabase();
    // .populate({ path: "reviews.reviewBy", model: User })
    const reviews = await Product.aggregate([
      { $unwind: "$reviews" },
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "reviews.reviewBy",
          foreignField: "_id",
          as: "reviewByDetails",
        },
      },
      {
        $project: {
          productId: "$_id",
          productName: "$name",
          productImage: { $arrayElemAt: ["$subProducts.images", 0] }, // Extract the first image
          productDescription: "$description",
          review: {
            rating: "$reviews.rating",
            review: "$reviews.review",
            reviewCreatedAt: "$reviews.reviewCreatedAt",
            verified: "$reviews.verified",
            _id: "$reviews._id",
            reviewBy: { $arrayElemAt: ["$reviewByDetails", 0] }, // Extract the first element
          },
        },
      },
      { $sort: { "review.reviewCreatedAt": -1 } },
    ]);
    return {
      reviews: JSON.parse(JSON.stringify(reviews)),
    };
  } catch (error) {
    console.log(error);
  }
};

// switch product review to verified
export const handleVerificationChange = async (id: string, value: boolean) => {
  try {
    await connectToDatabase();
    const product = await Product.findOneAndUpdate(
      { "reviews._id": id },
      { $set: { "reviews.$.verified": value } },
      { new: true }
    );

    if (!product) {
      return { message: "Review not found", success: false };
    }
    return { message: "Successfully updated review", success: true };
  } catch (error) {
    console.log(error);
  }
};