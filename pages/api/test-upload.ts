import { NextApiRequest, NextApiResponse } from 'next';
import { uploadImage } from '@/lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test if we can access a test image from the public folder
    const testImagePath = './public/assets/b1.jpg';
    
    console.log('Testing upload with path:', testImagePath);
    console.log('Cloudinary config check:', {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dwpjuqcd2',
      apiKey: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'missing'
    });

    // Try to upload a test image
    const result = await uploadImage(testImagePath, 'test-upload');
    
    res.status(200).json({
      success: true,
      message: 'Test upload successful',
      result: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    
    res.status(500).json({ 
      error: 'Test upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 