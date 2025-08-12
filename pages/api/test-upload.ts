import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test Cloudinary configuration
    const config = cloudinary.config();
    
    // Test a simple API call
    const result = await cloudinary.api.ping();
    
    res.status(200).json({
      success: true,
      message: 'Cloudinary is working!',
      config: {
        cloudName: config.cloud_name,
        apiKey: config.api_key ? '***' + config.api_key.slice(-4) : 'missing',
        apiSecret: config.api_secret ? '***' + config.api_secret.slice(-4) : 'missing'
      },
      ping: result,
      envVars: {
        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Cloudinary test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 