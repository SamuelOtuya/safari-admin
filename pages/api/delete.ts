// pages/api/delete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Support both old uploads folder and new assets folder
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'assets', filename),
      path.join(process.cwd(), 'public', 'uploads', filename),
      path.join(process.cwd(), 'public', filename.startsWith('/') ? filename.slice(1) : filename)
    ];

    let filePath = null;
    let fileFound = false;

    // Check each possible path
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        filePath = possiblePath;
        fileFound = true;
        break;
      }
    }

    if (!fileFound) {
      console.log('File not found in any of these paths:', possiblePaths);
      return res.status(404).json({ 
        error: 'File not found',
        filename,
        searchedPaths: possiblePaths
      });
    }

    // Delete the file
    if (filePath) {
      fs.unlinkSync(filePath);
      console.log('Successfully deleted:', filePath);
    }

    res.status(200).json({ 
      message: 'File deleted successfully',
      deletedFile: filePath 
    });

  } catch (error) {
    console.error('Delete error:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ 
      error: 'Delete failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}