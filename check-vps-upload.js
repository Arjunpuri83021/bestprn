// Script to check if video numbering functionality is uploaded to VPS
const axios = require('axios');

const VPS_API = 'https://api.majehimaje.life';

async function checkVpsUpload() {
  try {
    console.log('🔍 Checking if Video Numbering is uploaded to VPS...\n');

    // Test 1: Check API response structure
    console.log('1. Testing VPS API Response...');
    const response = await axios.get(`${VPS_API}/getpostdata?page=1&limit=5`).catch(err => {
      console.log('❌ VPS API Connection Error:', err.message);
      return null;
    });

    if (!response) {
      console.log('❌ Cannot connect to VPS API');
      return;
    }

    console.log('✅ VPS API Connected Successfully');
    console.log(`   Total Records: ${response.data.totalRecords}`);
    console.log(`   Records Returned: ${response.data.records.length}`);
    console.log('');

    // Test 2: Check for dynamicVideoNo field
    console.log('2. Checking for Video Numbering Fields...');
    
    let hasNewNumbering = false;
    let sampleVideo = null;
    
    if (response.data.records && response.data.records.length > 0) {
      sampleVideo = response.data.records[0];
      hasNewNumbering = sampleVideo.hasOwnProperty('dynamicVideoNo');
      
      console.log('📋 Sample Video Fields:');
      console.log(`   dynamicVideoNo: ${sampleVideo.dynamicVideoNo || 'NOT FOUND'}`);
      console.log(`   videoNo: ${sampleVideo.videoNo || 'NOT FOUND'}`);
      console.log(`   titel: ${sampleVideo.titel || 'NOT FOUND'}`);
      console.log(`   _id: ${sampleVideo._id || 'NOT FOUND'}`);
    }
    console.log('');

    // Test 3: Check multiple videos for numbering pattern
    console.log('3. Checking Numbering Pattern...');
    
    if (response.data.records.length > 1) {
      const firstVideo = response.data.records[0];
      const secondVideo = response.data.records[1];
      
      console.log('📊 First 2 Videos:');
      console.log(`   Video 1: dynamicVideoNo = ${firstVideo.dynamicVideoNo || 'MISSING'}`);
      console.log(`   Video 2: dynamicVideoNo = ${secondVideo.dynamicVideoNo || 'MISSING'}`);
      
      if (firstVideo.dynamicVideoNo && secondVideo.dynamicVideoNo) {
        const isDescending = firstVideo.dynamicVideoNo > secondVideo.dynamicVideoNo;
        console.log(`   Pattern: ${isDescending ? '✅ Descending (Correct)' : '❌ Not Descending'}`);
      }
    }
    console.log('');

    // Test 4: Final diagnosis
    console.log('🔧 DIAGNOSIS:');
    
    if (hasNewNumbering) {
      console.log('✅ SUCCESS: Video numbering functionality IS uploaded!');
      console.log('   ✅ dynamicVideoNo field found');
      console.log('   ✅ New numbering logic is working');
      console.log('   ✅ API returning numbered videos');
      
      if (response.data.totalRecords > 100) {
        console.log('   ✅ Good amount of data available');
      } else {
        console.log('   ⚠️  Limited data - only ' + response.data.totalRecords + ' records');
      }
      
    } else {
      console.log('❌ PROBLEM: Video numbering functionality NOT uploaded!');
      console.log('   ❌ dynamicVideoNo field missing');
      console.log('   ❌ Old API code still running');
      console.log('   📝 SOLUTION NEEDED:');
      console.log('      1. Re-upload api/controler/controlers.js');
      console.log('      2. Restart VPS service (pm2 restart api)');
      console.log('      3. Check file permissions');
    }

    // Test 5: Check if service restart is needed
    if (hasNewNumbering && response.data.totalRecords < 100) {
      console.log('');
      console.log('⚠️  ADDITIONAL CHECK NEEDED:');
      console.log('   Code is uploaded but data seems limited');
      console.log('   Possible database sync issue');
      console.log('   Check VPS database records count');
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    console.log('📝 Possible issues:');
    console.log('   - VPS server is down');
    console.log('   - API endpoint changed');
    console.log('   - Network connectivity issue');
  }
}

// Run the check
checkVpsUpload();
