// check-env.js - Simple script to check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Cloudinary environment variables...\n');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? `✅ Set (${cloudName})` : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', apiKey ? `✅ Set (***${apiKey.slice(-4)})` : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', apiSecret ? `✅ Set (***${apiSecret.slice(-4)})` : '❌ Missing');

console.log('\n📋 Summary:');
if (cloudName && apiKey && apiSecret) {
  console.log('✅ All Cloudinary environment variables are set!');
  console.log('🚀 Your upload should work now.');
} else {
  console.log('❌ Some environment variables are missing.');
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env.local file in your project root');
  console.log('2. Add your Cloudinary credentials:');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  console.log('3. Restart your development server');
}

console.log('\n🌐 Test your setup:');
console.log('- Visit: http://localhost:3000/api/simple-test');
console.log('- Visit: http://localhost:3000/admin'); 