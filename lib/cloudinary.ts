import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dwpjuqcd2';
const apiKey = process.env.CLOUDINARY_API_KEY || '771658231332589';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'Iv-PT8NM8C10PgYmWI58HSZStTTI';

console.log('Cloudinary config:', {
  cloudName,
  apiKey: apiKey ? '***' + apiKey.slice(-4) : 'missing',
  apiSecret: apiSecret ? '***' + apiSecret.slice(-4) : 'missing',
  usingEnvVars: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
});

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
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