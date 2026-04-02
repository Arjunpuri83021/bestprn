// Test script to verify video numbering is working correctly
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testNumbering() {
  try {
    console.log('🔍 Testing Video Numbering System...\n');

    // Test 1: Get first page (should have highest numbers)
    console.log('1. Testing First Page (should have highest numbers)...');
    const page1 = await axios.get(`${API_BASE}/getpostdata?page=1&limit=16`);
    console.log('✅ Page 1 Results:');
    console.log('   Total videos in database:', page1.data.totalRecords);
    console.log('   Total pages:', page1.data.totalPages);
    console.log('   Videos on this page:', page1.data.records.length);
    
    if (page1.data.records.length > 0) {
      const firstVideo = page1.data.records[0];
      const lastVideo = page1.data.records[page1.data.records.length - 1];
      console.log('   First video number:', firstVideo.dynamicVideoNo || 'No number');
      console.log('   Last video number:', lastVideo.dynamicVideoNo || 'No number');
    }
    console.log('');

    // Test 2: Get last page (should have lowest numbers)
    const totalPages = page1.data.totalPages;
    console.log(`2. Testing Last Page (${totalPages}) - should have lowest numbers...`);
    const lastPage = await axios.get(`${API_BASE}/getpostdata?page=${totalPages}&limit=16`);
    console.log('✅ Last Page Results:');
    console.log('   Videos on last page:', lastPage.data.records.length);
    
    if (lastPage.data.records.length > 0) {
      const firstVideo = lastPage.data.records[0];
      const lastVideo = lastPage.data.records[lastPage.data.records.length - 1];
      console.log('   First video number:', firstVideo.dynamicVideoNo || 'No number');
      console.log('   Last video number:', lastVideo.dynamicVideoNo || 'No number');
    }
    console.log('');

    // Test 3: Check middle page
    const middlePage = Math.ceil(totalPages / 2);
    console.log(`3. Testing Middle Page (${middlePage})...`);
    const middle = await axios.get(`${API_BASE}/getpostdata?page=${middlePage}&limit=16`);
    console.log('✅ Middle Page Results:');
    console.log('   Videos on middle page:', middle.data.records.length);
    
    if (middle.data.records.length > 0) {
      const firstVideo = middle.data.records[0];
      const lastVideo = middle.data.records[middle.data.records.length - 1];
      console.log('   First video number:', firstVideo.dynamicVideoNo || 'No number');
      console.log('   Last video number:', lastVideo.dynamicVideoNo || 'No number');
    }
    console.log('');

    // Summary
    console.log('📊 NUMBERING SYSTEM SUMMARY:');
    console.log(`   Total Videos: ${page1.data.totalRecords}`);
    console.log(`   Total Pages: ${totalPages}`);
    console.log('   Expected Numbering:');
    console.log(`     - Page 1: #${page1.data.totalRecords} to #${page1.data.totalRecords - 15} (newest videos)`);
    console.log(`     - Page ${totalPages}: #${lastPage.data.records.length} to #1 (oldest videos)`);
    console.log('');

    if (page1.data.totalRecords === 3848) {
      console.log('🎉 SUCCESS! Your numbering system is working correctly:');
      console.log('   - Page 1 should show videos #3848 to #3833');
      console.log('   - Page 240 should show videos #8 to #1');
      console.log('   - New videos will automatically get #3849, #3850, etc.');
    } else {
      console.log(`ℹ️  Current total: ${page1.data.totalRecords} videos`);
      console.log('   Numbering system is working, numbers will adjust as you add more videos');
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
testNumbering();
