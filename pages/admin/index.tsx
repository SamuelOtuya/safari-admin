// pages/admin/index.tsx
"use client";

import { useState, useRef } from 'react';
import SafeImage from './SafeImage';

interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fullPath: string;
  uploadDate: string;
  size: number;
  experienceType: string;
  imageIndex: number;
  cloudinaryId?: string;
  storage?: string;
}

interface ExperienceMapping {
  folder: string;
  prefix: string;
  numbers: number[];
  displayName: string;
  description: string;
}

const EXPERIENCE_MAPPINGS: Record<string, ExperienceMapping> = {
  'balloon': {
    folder: 'assets',
    prefix: 'b',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Balloon Flight',
    description: 'Hot air balloon safari images (b1.jpg - b10.jpg)'
  },
  'breakfast': {
    folder: 'assets', 
    prefix: 'r',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Bush Breakfast',
    description: 'Bush breakfast images (r1.jpg - r10.jpg)'
  },
  'accommodation': {
    folder: 'assets',
    prefix: 'ac',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Luxury Accommodation',
    description: 'Accommodation images (ac1.webp, ac2.jpg - ac10.jpg)'
  },
  'vehicle': {
    folder: 'assets',
    prefix: 'v',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Safari Vehicle',
    description: 'Vehicle transport images (v1.jpg - v10.jpg)'
  },
  'meals': {
    folder: 'assets',
    prefix: 'm', 
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'All-Inclusive Meals',
    description: 'Meal images (m1.jpg - m10.jpg)'
  },
  'wildlife': {
    folder: 'assets',
    prefix: 'w',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Wildlife Safari',
    description: 'Wildlife photography (w1.jpg - w10.jpg)'
  },
  'landscape': {
    folder: 'assets',
    prefix: 'l',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Landscape Views',
    description: 'Scenic landscapes (l1.jpg - l10.jpg)'
  },
  'activities': {
    folder: 'assets',
    prefix: 'a',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Safari Activities',
    description: 'Adventure activities (a1.jpg - a10.jpg)'
  },
  'sunset': {
    folder: 'assets',
    prefix: 's',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Sunset & Sunrise',
    description: 'Golden hour moments (s1.jpg - s10.jpg)'
  },
  'guides': {
    folder: 'assets',
    prefix: 'g',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    displayName: 'Safari Guides',
    description: 'Professional guides (g1.jpg - g10.jpg)'
  }
};

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('balloon');
  const [selectedImageIndex, setSelectedImageIndex] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [storageMode, setStorageMode] = useState<'cloudinary' | 'local'>('cloudinary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - you can make this more secure
    if (password === 'admin' || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Handle file upload with experience type and index
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      // Check file size (5MB limit for Vercel)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('experienceType', selectedExperience);
      formData.append('imageIndex', selectedImageIndex.toString());

      try {
        // Choose upload endpoint based on storage mode
        const uploadEndpoint = storageMode === 'cloudinary' ? '/api/upload' : '/api/upload-local';
        
        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          const newImage: UploadedImage = {
            id: Date.now().toString() + i,
            filename: result.filename,
            originalName: file.name,
            url: result.url,
            fullPath: result.fullPath,
            uploadDate: new Date().toISOString(),
            size: file.size,
            experienceType: result.experienceType,
            imageIndex: result.imageIndex,
            storage: result.storage || storageMode,
          };
          
          setImages(prev => [newImage, ...prev]);
          alert(`✅ Uploaded as ${result.filename} - Ready to use in your website!`);
        } else {
          console.error('Upload failed:', result);
          alert(`❌ Failed to upload ${file.name}: ${result.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`❌ Network error uploading ${file.name}. Please try again.`);
      }
    }
    
    setUploading(false);
  };

  // Delete image
  const handleDelete = async (imageId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      console.log('Attempting to delete:', filename);
      
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const result = await response.json();
      console.log('Delete response:', result);

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        alert('✅ Image deleted successfully');
      } else {
        console.error('Delete failed:', result);
        alert(`❌ Failed to delete image: ${result.error}`);
        
        // Try alternative deletion if the filename might be different
        if (result.error === 'File not found') {
          const alternativeDelete = await fetch('/api/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: `assets/${filename}` }),
          });
          
          if (alternativeDelete.ok) {
            setImages(prev => prev.filter(img => img.id !== imageId));
            alert('✅ Image deleted successfully (alternative path)');
          }
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      alert(`❌ Error deleting image: ${message}`);
    }
  };

  const copyToClipboard = (url: string, type: 'relative' | 'full' = 'relative') => {
    const textToCopy = type === 'full' ? `${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000'}${url}` : url;
    navigator.clipboard.writeText(textToCopy);
    alert(`✅ ${type === 'full' ? 'Full URL' : 'Relative path'} copied to clipboard!`);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Safari Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentMapping = EXPERIENCE_MAPPINGS[selectedExperience];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Safari Image Admin</h1>
              <p className="text-gray-600">Upload images with exact filenames that match your website</p>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Storage Mode Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Storage Mode</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="cloudinary"
                checked={storageMode === 'cloudinary'}
                onChange={(e) => setStorageMode(e.target.value as 'cloudinary' | 'local')}
                className="mr-2"
              />
              <span>Cloudinary (Cloud Storage)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="local"
                checked={storageMode === 'local'}
                onChange={(e) => setStorageMode(e.target.value as 'cloudinary' | 'local')}
                className="mr-2"
              />
              <span>Local Storage</span>
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {storageMode === 'cloudinary' 
              ? 'Images will be uploaded to Cloudinary cloud storage. Requires valid Cloudinary credentials.'
              : 'Images will be saved locally in the public/uploads folder. No external service required.'
            }
          </p>
        </div>

        {/* Experience Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Experience & Image Slot</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Experience Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Type
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setSelectedImageIndex(EXPERIENCE_MAPPINGS[e.target.value].numbers[0]);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(EXPERIENCE_MAPPINGS).map(([key, mapping]) => (
                  <option key={key} value={key}>
                    {mapping.displayName}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">{currentMapping.description}</p>
            </div>

            {/* Image Index */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Slot
              </label>
              <select
                value={selectedImageIndex}
                onChange={(e) => setSelectedImageIndex(parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentMapping.numbers.map(num => {
                  const extension = selectedExperience === 'accommodation' && num === 1 ? '.webp' : '.jpg';
                  return (
                    <option key={num} value={num}>
                      Slot {num} → {currentMapping.prefix}{num}{extension}
                    </option>
                  );
                })}
              </select>
              <p className="text-sm text-blue-600 mt-1">
                Will save as: <strong>
                  {currentMapping.prefix}{selectedImageIndex}
                  {selectedExperience === 'accommodation' && selectedImageIndex === 1 ? '.webp' : '.jpg'}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Uploading and renaming image...</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    Click to upload image for <strong>{currentMapping.displayName}</strong>
                  </p>
                  <p className="text-sm text-blue-600">
                    Will be saved as: <strong>/assets/{currentMapping.prefix}{selectedImageIndex}
                    {selectedExperience === 'accommodation' && selectedImageIndex === 1 ? '.webp' : '.jpg'}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Storage: {storageMode === 'cloudinary' ? 'Cloudinary' : 'Local (/uploads/)'}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Select Image File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recently Uploaded ({images.length})
          </h2>
          
          {images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative h-48">
                    <SafeImage
                      src={image.fullPath}
                      alt={image.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-sm text-green-600">
                        ✅ {image.filename}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {EXPERIENCE_MAPPINGS[image.experienceType]?.displayName}
                      </p>
                      <p className="text-xs text-blue-500">
                        Storage: {image.storage || 'unknown'}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      <p>Size: {(image.size / 1024).toFixed(2)} KB</p>
                      <p>Uploaded: {new Date(image.uploadDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={image.url}
                        readOnly
                        className="text-xs bg-gray-50 p-2 rounded border w-full"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => copyToClipboard(image.url)}
                          className="bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700 transition"
                        >
                          Copy Path
                        </button>
                        
                        <button
                          onClick={() => copyToClipboard(image.fullPath, 'full')}
                          className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition"
                        >
                          Copy {image.storage === 'local' ? 'Local' : 'Cloudinary'} URL
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(image.id, image.cloudinaryId || image.filename)}
                        className="w-full bg-red-600 text-white px-3 py-2 rounded text-xs hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        {/* <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h3>
          <ol className="text-blue-700 space-y-1 text-sm">
            <li>1. Select the experience type and image slot you want to replace</li>
            <li>2. Upload your new image - it will automatically get the correct filename</li>
            <li>3. The image is now accessible at the same path your website expects</li>
            <li>4. No changes needed to your frontend code! 🎉</li>
          </ol>
        </div> */}
      </div>
    </div>
  );
}