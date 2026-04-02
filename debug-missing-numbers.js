// Debug script to check for missing video numbers
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function debugMissingNumbers() {
  try {
    console.log('🔍 Debugging Missing Video Numbers...\n');

    // Get first page
    console.log('1. Checking first page for video numbers...');
    const response = await axios.get(`${API_BASE}/getpostdata?page=1&limit=16`);
    
    console.log('✅ API Response Info:');
    console.log('   Total records:', response.data.totalRecords);
    console.log('   Records returned:', response.data.records.length);
    console.log('   Current page:', response.data.currentPage);
    console.log('');

    // Check each video for numbers
    console.log('2. Checking individual videos for numbers...');
    let videosWithNumbers = 0;
    let videosWithoutNumbers = 0;
    
    response.data.records.forEach((video, index) => {
      const hasNumber = video.dynamicVideoNo || video.videoNo;
      
      if (hasNumber) {
        videosWithNumbers++;
        if (index < 5) { // Show first 5 for debugging
          console.log(`   ✅ Video ${index + 1}: #${video.dynamicVideoNo || video.videoNo} - "${video.titel}"`);
        }
      } else {
        videosWithoutNumbers++;
        console.log(`   ❌ Video ${index + 1}: NO NUMBER - "${video.titel}" (ID: ${video._id})`);
      }
    });

    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`   Videos WITH numbers: ${videosWithNumbers}`);
    console.log(`   Videos WITHOUT numbers: ${videosWithoutNumbers}`);
    console.log('');

    if (videosWithoutNumbers > 0) {
      console.log('🚨 ISSUE FOUND:');
      console.log(`   ${videosWithoutNumbers} videos are missing numbers!`);
      console.log('   This could be because:');
      console.log('   1. API is not assigning dynamicVideoNo properly');
      console.log('   2. Some videos have null/undefined videoNo in database');
      console.log('   3. Frontend is not receiving the numbers correctly');
      console.log('');
      
      // Check raw API response structure
      console.log('3. Checking raw API response structure...');
      const sampleVideo = response.data.records[0];
      console.log('   Sample video keys:', Object.keys(sampleVideo));
      console.log('   dynamicVideoNo:', sampleVideo.dynamicVideoNo);
      console.log('   videoNo:', sampleVideo.videoNo);
      console.log('   _id:', sampleVideo._id);
      console.log('   titel:', sampleVideo.titel);
      
    } else {
      console.log('🎉 SUCCESS: All videos have numbers!');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Status:', error.response.status);
    }
  }
}

// Run the debug
debugMissingNumbers();
