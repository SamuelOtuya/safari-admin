// pages/api/delete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteImage } from '@/lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cloudinaryId } = req.body;

    if (!cloudinaryId) {
      return res.status(400).json({ error: 'Cloudinary ID is required' });
    }

    const result = await deleteImage(cloudinaryId);

    res.status(200).json({
      message: 'Image deleted successfully',
      result
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
}