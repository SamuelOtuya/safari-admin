import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  res.status(200).json({
    cloudinaryConfigured: !!(cloudName && apiKey && apiSecret),
    hasCloudName: !!cloudName,
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    cloudName: cloudName ? 'Set' : 'Missing',
    apiKey: apiKey ? 'Set' : 'Missing',
    apiSecret: apiSecret ? 'Set' : 'Missing',
  });
} 