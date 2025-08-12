// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadImage } from '@/lib/cloudinary';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
  maxDuration: 30,
};

// Mapping of experience types to their expected filenames
const EXPERIENCE_MAPPINGS = {
  'balloon': {
    folder: 'assets',
    prefix: 'b',
    numbers: [3, 5] // Will generate b3.jpg, b5.jpg
  },
  'breakfast': {
    folder: 'assets', 
    prefix: 'r',
    numbers: [1, 2, 3, 4, 5, 6] // Will generate r1.jpg, r2.jpg, etc.
  },
  'accommodation': {
    folder: 'assets',
    prefix: 'ac',
    numbers: [1, 2] // Will generate ac1.webp, ac2.jpg
  },
  'vehicle': {
    folder: 'assets',
    prefix: 'v',
    numbers: [1, 2] // Will generate v1.jpg, v2.jpg
  },
  'meals': {
    folder: 'assets',
    prefix: 'r', 
    numbers: [1, 2, 3, 4, 5, 6] // Same as breakfast
  }
} as const;

type ExperienceType = keyof typeof EXPERIENCE_MAPPINGS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      maxFiles: 1,
      allowEmptyFiles: false,
      minFileSize: 1,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const experienceType = Array.isArray(fields.experienceType) ? fields.experienceType[0] : fields.experienceType;
    const imageIndex = Array.isArray(fields.imageIndex) ? parseInt(fields.imageIndex[0]) : parseInt(fields.imageIndex || '1');

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!experienceType || !(experienceType in EXPERIENCE_MAPPINGS)) {
      return res.status(400).json({ 
        error: 'Invalid experience type. Must be one of: ' + Object.keys(EXPERIENCE_MAPPINGS).join(', ')
      });
    }

    const mapping = EXPERIENCE_MAPPINGS[experienceType as ExperienceType];
    
    // Generate filename to match your existing structure
    const fileExtension = path.extname(file.originalFilename || '').toLowerCase() || '.jpg';
    const targetFilename = `${mapping.prefix}${imageIndex}${fileExtension}`;

    // Upload to Cloudinary
    const result = await uploadImage(file.filepath, `safari-admin/${targetFilename}`);

    // Generate URL that matches your existing import structure
    const fileUrl = `/assets/${targetFilename}`;

    res.status(200).json({
      message: 'File uploaded successfully',
      filename: targetFilename,
      url: fileUrl,
      originalName: file.originalFilename,
      size: file.size,
      experienceType,
      imageIndex,
      fullPath: result.secure_url, // Use Cloudinary URL
      cloudinaryId: result.public_id,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Check if Cloudinary credentials are missing
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Environment variables missing:', {
        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET
      });
      return res.status(500).json({ 
        error: 'Cloudinary configuration missing. Please check environment variables.',
        debug: {
          cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: !!process.env.CLOUDINARY_API_KEY,
          apiSecret: !!process.env.CLOUDINARY_API_SECRET
        }
      });
    }
    
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}