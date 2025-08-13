// pages/api/upload-local.ts - Alternative upload using local file storage
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

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
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'breakfast': {
    folder: 'assets', 
    prefix: 'r',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'accommodation': {
    folder: 'assets',
    prefix: 'ac',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'vehicle': {
    folder: 'assets',
    prefix: 'v',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'meals': {
    folder: 'assets',
    prefix: 'm', 
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'wildlife': {
    folder: 'assets',
    prefix: 'w',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'landscape': {
    folder: 'assets',
    prefix: 'l',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'activities': {
    folder: 'assets',
    prefix: 'a',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'sunset': {
    folder: 'assets',
    prefix: 's',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  'guides': {
    folder: 'assets',
    prefix: 'g',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
} as const;

type ExperienceType = keyof typeof EXPERIENCE_MAPPINGS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Local upload API is working!',
      storage: 'local',
      uploadsDir: './public/uploads'
    });
  }
  
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

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Copy file to uploads directory
    const targetPath = path.join(uploadsDir, targetFilename);
    fs.copyFileSync(file.filepath, targetPath);

    // Generate URL that matches your existing import structure
    const fileUrl = `/uploads/${targetFilename}`;

    res.status(200).json({
      message: 'File uploaded successfully (local storage)',
      filename: targetFilename,
      url: fileUrl,
      originalName: file.originalFilename,
      size: file.size,
      experienceType,
      imageIndex,
      fullPath: fileUrl, // Local URL
      storage: 'local'
    });

  } catch (error) {
    console.error('Local upload error:', error);
    
    res.status(500).json({ 
      error: 'Local upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
} 