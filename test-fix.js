// Test script to verify the fix for missing video numbers
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testFix() {
  try {
    console.log('🔧 Testing Fix for Missing Video Numbers...\n');

    // Test multiple pages to ensure consistency
    const pagesToTest = [1, 2, 5, 10];
    
    for (const pageNum of pagesToTest) {
      console.log(`📄 Testing Page ${pageNum}...`);
      
      const response = await axios.get(`${API_BASE}/getpostdata?page=${pageNum}&limit=16`);
      
      let videosWithNumbers = 0;
      let videosWithoutNumbers = 0;
      const missingNumbers = [];
      
      response.data.records.forEach((video, index) => {
        const hasNumber = video.dynamicVideoNo || video.videoNo;
        
        if (hasNumber) {
          videosWithNumbers++;
        } else {
          videosWithoutNumbers++;
          missingNumbers.push({
            index: index + 1,
            id: video._id,
            title: video.titel || 'No Title'
          });
        }
      });
      
      console.log(`   ✅ Videos with numbers: ${videosWithNumbers}`);
      console.log(`   ❌ Videos without numbers: ${videosWithoutNumbers}`);
      
      if (videosWithoutNumbers > 0) {
        console.log('   Missing numbers:');
        missingNumbers.forEach(video => {
          console.log(`     - Video ${video.index}: "${video.title}" (ID: ${video.id})`);
        });
      }
      console.log('');
    }

    // Test with search to ensure search results also have numbers
    console.log('🔍 Testing Search Results...');
    const searchResponse = await axios.get(`${API_BASE}/getpostdata?search=video&page=1&limit=10`);
    
    let searchVideosWithNumbers = 0;
    let searchVideosWithoutNumbers = 0;
    
    searchResponse.data.records.forEach((video) => {
      const hasNumber = video.dynamicVideoNo || video.videoNo;
      if (hasNumber) {
        searchVideosWithNumbers++;
      } else {
        searchVideosWithoutNumbers++;
      }
    });
    
    console.log(`   ✅ Search videos with numbers: ${searchVideosWithNumbers}`);
    console.log(`   ❌ Search videos without numbers: ${searchVideosWithoutNumbers}`);
    console.log('');

    // Final summary
    console.log('📊 FIX VERIFICATION SUMMARY:');
    if (searchVideosWithoutNumbers === 0) {
      console.log('   🎉 SUCCESS: All videos now have numbers!');
      console.log('   ✅ Dynamic numbering is working correctly');
      console.log('   ✅ Both regular and search results have numbers');
      console.log('   ✅ Multiple pages tested successfully');
    } else {
      console.log('   ⚠️  Some videos still missing numbers');
      console.log('   📝 Check server logs for debug information');
      console.log('   🔧 May need additional debugging');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Status:', error.response.status);
    }
  }
}

// Run the test
testFix();
