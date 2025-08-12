import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasCloudinaryCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasCloudinaryApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasCloudinaryApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Simple test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 