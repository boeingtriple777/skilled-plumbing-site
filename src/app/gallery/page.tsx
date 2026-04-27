export const revalidate = 3600;
export const dynamic = "force-dynamic";

import { v2 as cloudinary } from "cloudinary";
import WorkGallery from "./WorkGallery"; // Adjust import path as needed


// 1. Configure the Cloudinary Node SDK
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,       // Keep these secure on the server!
  api_secret: process.env.CLOUDINARY_API_SECRET, // Keep these secure on the server!
  secure: true,
});

export default async function GalleryPage() {
  // 2. Fetch the folder contents.
  // Change 'skilled-plumbing-gallery' to whatever Ren's folder is actually named in Cloudinary
  const { resources } = await cloudinary.search
    .expression("folder:portfolio/*")
    .sort_by("created_at", "desc")
    .max_results(30)
    .execute();

  // 3. Map the response to the exact format react-photo-album needs
  const dynamicPhotos = resources.map((file: { public_id: string; width: number; height: number }) => ({
    src: file.public_id,
    width: file.width,   
    height: file.height, 
  }));

  // 4. Pass the data to your Client Component
  return <WorkGallery photos={dynamicPhotos} />;
}