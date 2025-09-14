"use client";

import {
  deleteBannerById,
  fetchAllBanners,
  uploadBannerImages,
} from "@/lib/database/actions/admin/banners/banners.actions";
import { useEffect, useState } from "react";

type BannerType = "website_banners" | "app_banners";
const AppBannerImages = () => {
  type CloudinaryImage = {
    public_id: string;
    format: string;
    version: number;
    resource_type: string;
    type: string;
    placeholder: boolean;
    created_at: string;
    bytes: number;
    width: number;
    height: number;
    secure_url: string;
    url: string;
    tags: string[];
    // You can add more properties if needed
  };
  const [selectedType] = useState<BannerType>("app_banners");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [folderImages, setFolderImages] = useState<CloudinaryImage[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleImageChange = (e: any) => {
    const files: any = Array.from(e.target.files);
    setSelectedImages(files);

    const previews = files.map((file: any) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };
  const fetchFolderImages = async (type: BannerType) => {
    setLoading(true);
    await fetchAllBanners(type)
      .then((res) => {
        if (res) {
          setFolderImages(res); // Store fetched images
        }
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
        setLoading(false);
      });
  };
  const handleUpload = async () => {
    setUploading(true);

    // Convert images to base64
    const base64Images: string[] = await Promise.all(
    selectedImages.map(
        (image) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
        })
    )
    );

    await uploadBannerImages(base64Images, selectedType).then((res) => {
      setUploading(false);
      alert("Images uploaded successfully");
      setPreviewImages([]);
      setSelectedImages([]);
      fetchFolderImages(selectedType); // Fetch images after uploading
    });
  };
  const handleDelete = async (public_id: string) => {
    try {
      setDeleting(true);
      await deleteBannerById(public_id)
        .then((res) => {
          if (res?.success) {
            alert(res?.message);
            fetchFolderImages(selectedType);
          } else {
            alert(res?.message);
            fetchFolderImages(selectedType);
          }
        })
        .finally(() => {
          setDeleting(false);
        });
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchFolderImages(selectedType); // Fetch images on component mount
  }, []);
  return (
    <>
      <div>
        <center className="text-2xl">App Banner Images</center>
        <div className="p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 3a1 1 0 011-1h10a1 1 0 011 1v12.586l-3-3A2 2 0 0010 14H4a2 2 0 00-2 2V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
              <path d="M13 14.293l3.707 3.707-1.414 1.414L10 13.414l-5.293 5.293L3.293 17l3.707-3.707V4h6v10.293z" />
            </svg>
            <span className="mt-2 text-sm text-gray-600">
              Drag and drop your images here
            </span>
            <span className="text-sm text-gray-500">or</span>
            <span className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Browse Files
            </span>
          </label>
        </div>
        <div className="mt-6">
          {previewImages.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {previewImages.map((src, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-6 w-full px-4 py-2 text-white rounded-md ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:green-600"
          }`}
        >
          {uploading ? "Uploading" : "Upload Images"}
        </button>
      </div>
      <center>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">
            Images in folder
          </h2>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {loading ? (
              "Loading..."
            ) : folderImages.length > 0 ? (
              folderImages.map((image: any, index: number) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden"
                >
                  <img
                    src={image.secure_url}
                    alt={`Folder Image ${index}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    onClick={() => handleDelete(image.public_id)}
                    disabled={deleting}
                    className={`absolute top-1 right-1 px-2 py-1 text-xs text-white rounded ${
                      deleting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))
            ) : (
              <div>No Banner Images saved</div>
            )}
          </div>
        </div>
      </center>
    </>
  );
};

export default AppBannerImages;