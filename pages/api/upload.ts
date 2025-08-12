// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
    // Increase response size limit for Vercel
    responseLimit: '10mb',
  },
  // Set maximum execution time
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
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create assets directory to match your existing structure
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: assetsDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // Reduced to 5MB for Vercel
      maxFiles: 1, // Only one file at a time
      allowEmptyFiles: false,
      minFileSize: 1, // At least 1 byte
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const experienceType = Array.isArray(fields.experienceType) ? fields.experienceType[0] : fields.experienceType;
    const imageIndex = Array.isArray(fields.imageIndex) ? parseInt(fields.imageIndex[0]) : parseInt(fields.imageIndex || '1');

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (
      !experienceType ||
      typeof experienceType !== 'string' ||
      !(experienceType in EXPERIENCE_MAPPINGS)
    ) {
      return res.status(400).json({ 
        error: 'Invalid experience type. Must be one of: ' + Object.keys(EXPERIENCE_MAPPINGS).join(', ')
      });
    }

    const mapping = EXPERIENCE_MAPPINGS[experienceType as keyof typeof EXPERIENCE_MAPPINGS];
    
    // Generate filename to match your existing structure
    const fileExtension = path.extname(file.originalFilename || '').toLowerCase() || '.jpg';
    const targetFilename = `${mapping.prefix}${imageIndex}${fileExtension}`;
    const targetPath = path.join(assetsDir, targetFilename);

    // Move and rename the file
    fs.renameSync(file.filepath, targetPath);

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
      fullPath: `${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000'}${fileUrl}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}