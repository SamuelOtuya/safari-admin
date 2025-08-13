import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate that all required environment variables are present
if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing! Please check your .env file:');
  console.error('   CLOUDINARY_CLOUD_NAME:', cloudName ? '✓ Set' : '✗ Missing');
  console.error('   CLOUDINARY_API_KEY:', apiKey ? '✓ Set' : '✗ Missing');
  console.error('   CLOUDINARY_API_SECRET:', apiSecret ? '✓ Set' : '✗ Missing');
  console.error('   Make sure your .env file contains all three variables.');
} else {
  console.log('✅ Cloudinary configuration loaded successfully');
  console.log('   Cloud Name:', cloudName);
  console.log('   API Key:', '***' + apiKey.slice(-4));
  console.log('   API Secret:', '***' + apiSecret.slice(-4));
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;

// Helper function to upload image
export const uploadImage = async (filePath: string, publicId: string) => {
  try {
    // Check if Cloudinary is properly configured
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary not configured. Please check your .env file.');
    }

    console.log(`📤 Uploading to Cloudinary: ${publicId}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'safari-admin',
      resource_type: 'image',
      overwrite: true,
    });

    console.log(`✅ Upload successful: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Cloudinary authentication failed. Please check your API credentials in .env file.');
      }
      if (error.message.includes('Invalid signature')) {
        throw new Error('Invalid Cloudinary API secret. Please check your CLOUDINARY_API_SECRET in .env file.');
      }
      if (error.message.includes('not configured')) {
        throw new Error('Cloudinary not configured. Please check your .env file has all required variables.');
      }
    }
    
    throw error;
  }
};

// Helper function to delete image
export const deleteImage = async (publicId: string) => {
  try {
    // Check if Cloudinary is properly configured
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary not configured. Please check your .env file.');
    }

    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log(`✅ Delete successful: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};

// Helper function to test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    // Check if Cloudinary is properly configured
    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Cloudinary not configured',
        details: {
          cloudName: !!cloudName,
          apiKey: !!apiKey,
          apiSecret: !!apiSecret
        }
      };
    }

    const result = await cloudinary.api.ping();
    return {
      success: true,
      message: 'Cloudinary connection successful',
      ping: result
    };
  } catch (error) {
    return {
      success: false,
      error: 'Cloudinary connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 