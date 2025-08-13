import { NextApiRequest, NextApiResponse } from 'next';
import { testCloudinaryConnection } from '@/lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test Cloudinary connection using the new helper function
    const result = await testCloudinaryConnection();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Cloudinary connection test successful!',
        ping: result.ping,
        config: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
          apiSecret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'missing'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Cloudinary connection test failed',
        details: result.error,
        config: result.details
      });
    }

  } catch (error) {
    console.error('Simple test error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Cloudinary connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 