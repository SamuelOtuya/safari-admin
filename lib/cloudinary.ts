import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwpjuqcd2',
  api_key: process.env.CLOUDINARY_API_KEY || '771658231332589',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Iv-PT8NM8C10PgYmWI58HSZStTTI',
});

export default cloudinary;

// Helper function to upload image
export const uploadImage = async (filePath: string, publicId: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'safari-admin',
      resource_type: 'image',
      overwrite: true,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Helper function to delete image
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}; 