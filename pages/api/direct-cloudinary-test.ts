import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Configure Cloudinary directly
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dwpjuqcd2';
    const apiKey = process.env.CLOUDINARY_API_KEY || '771658231332589';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'Iv-PT8NM8C10PgYmWI58HSZStTTI';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Test the configuration
    const config = cloudinary.config();
    
    res.status(200).json({
      success: true,
      message: 'Direct Cloudinary test working!',
      config: {
        cloudName: config.cloud_name,
        apiKey: config.api_key ? '***' + config.api_key.slice(-4) : 'missing',
        apiSecret: config.api_secret ? '***' + config.api_secret.slice(-4) : 'missing'
      },
      envVars: {
        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      },
      fallbackUsed: {
        cloudName: !process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !process.env.CLOUDINARY_API_KEY,
        apiSecret: !process.env.CLOUDINARY_API_SECRET
      }
    });

  } catch (error) {
    console.error('Direct test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Direct Cloudinary test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 